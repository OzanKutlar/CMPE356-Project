package cmpe.project.Project.Endpoints;

import cmpe.project.Project.DatabaseHandler.DatabaseHandler;
import cmpe.project.Project.Utility.Util;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.*;

import static cmpe.project.Project.Utility.Logger.log;
import static cmpe.project.Project.Utility.Logger.logError;


@RestController
@RequestMapping("/api/admin")
public class AdminEndpoints {


    @GetMapping("/serverMetrics")
    public ResponseEntity<?> serverMetrics(@RequestHeader("userID") String userID) {
        String userIdFromSession = UserEndpoints.sessionMap.get(Util.getUuidOrNull(userID));
        if (userIdFromSession == null) {
            return ResponseEntity.ok().body(Map.of("msg", "error", "message", "Invalid user ID"));
        }

        log("Server info requested by user %s", userIdFromSession);

        String isAdminQuery = "SELECT role FROM users WHERE id = ?";
        Object[] isAdminParams = { userIdFromSession };
        try (ResultSet rs = DatabaseHandler.INSTANCE.sendRequest(isAdminQuery, isAdminParams)) {
            if (rs == null || !rs.next() || !rs.getString("role").equalsIgnoreCase("admin")) {
                System.out.println("User with ID " + userID + " is not authorized to get users list");
                return ResponseEntity.ok().body(Map.of("msg", "error", "message", "User unauthorized"));
            }
        } catch (SQLException e) {
            logError("Error executing SQL request: " + isAdminQuery + ". Error: " + e.getMessage());
            return ResponseEntity.ok().body(Map.of("msg", "error", "message", "An error occurred server-side"));
        }

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("msg", "success");

        try {
            String cpuCommand = "powershell.exe (Get-Counter '\\Processor(_Total)\\% Processor Time').CounterSamples.CookedValue";
            String cpuUsage = runCommand(cpuCommand).trim();
            metrics.put("cpu", String.format("%.2f%%", Double.parseDouble(cpuUsage)));

            String ramCommand = "powershell.exe \"Get-WmiObject Win32_OperatingSystem | Select-Object @{Name='Total';Expression={[math]::Round($_.TotalVisibleMemorySize / 1048576, 2)}}, @{Name='Free';Expression={[math]::Round($_.FreePhysicalMemory / 1048576, 2)}} | ConvertTo-Json\"";
            String ramOutput = runCommand(ramCommand);
            Map<String, Object> ramMap = parseJson(ramOutput);
            metrics.put("ram", ((Double) ramMap.get("Total") - (Double) ramMap.get("Free")));
            metrics.put("ramTotalMB", ramMap.get("Total"));

            String netCommand = "powershell.exe \"Get-Counter '\\Network Interface(*)\\Bytes Received/sec','\\Network Interface(*)\\Bytes Sent/sec' | Select-Object -ExpandProperty CounterSamples | Measure-Object -Property CookedValue -Sum | Select-Object -ExpandProperty Sum\"";
            String netBytesPerSec = runCommand(netCommand).trim();
            double netMbitPerSec = (Double.parseDouble(netBytesPerSec) * 8) / 1_000_000;
            metrics.put("network", String.format("%.2f", netMbitPerSec));
            metrics.put("timestamp", System.currentTimeMillis());

        } catch (Exception e) {
            logError("Error collecting server metrics: " + e.getMessage());
            return ResponseEntity.ok().body(Map.of("msg", "error", "message", "Failed to get server metrics"));
        }

        return ResponseEntity.ok().body(metrics);
    }

    // Helper to run PowerShell commands
    private String runCommand(String command) throws Exception {
        ProcessBuilder builder = new ProcessBuilder("cmd.exe", "/c", command);
        builder.redirectErrorStream(true);
        Process process = builder.start();

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
            StringBuilder output = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line).append("\n");
            }
            process.waitFor();
            return output.toString();
        }
    }

    // Optional: if you use Jackson or similar for parsing JSON strings into maps
    private Map<String, Object> parseJson(String json) throws Exception {
        return new com.fasterxml.jackson.databind.ObjectMapper().readValue(json, Map.class);
    }


    @GetMapping("/getUsers")
    public ResponseEntity<?> getUsers(
            @RequestHeader("userID") String userID,
            @RequestHeader(value = "roleFilter", required = false) String roleFilter) {
        System.out.println("Getting users" +
                (roleFilter != null ? " with role: " + roleFilter : ""));

        log("All User Info Requested by user %s", userID);

        String userIdFromSession = UserEndpoints.sessionMap.get(Util.getUuidOrNull(userID));
        if (userIdFromSession == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid user ID"));
        }


        String isAdminQuery = "SELECT role FROM users WHERE id = ?";
        Object[] isAdminParams = { userIdFromSession };
        try (ResultSet rs = DatabaseHandler.INSTANCE.sendRequest(isAdminQuery, isAdminParams)) {
            if (rs == null || !rs.next() || !rs.getString("role").equalsIgnoreCase("admin")) {
                System.out.println("User with ID " + userID + " is not authorized to get users list");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User is not authorized"));
            }
        } catch (SQLException e) {
            logError("Error executing SQL request: " + isAdminQuery + ". Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to check user role"));
        }


        String getUsersQuery = "SELECT * FROM users";
        Object[] getUsersParams;
        if (roleFilter != null) {
            getUsersQuery += " WHERE role = ?";
            getUsersParams = new Object[] { roleFilter };
        } else {
            getUsersParams = new Object[] {};
        }
        List<Map<String, Object>> usersList = new ArrayList<>();
        try (ResultSet rs = DatabaseHandler.INSTANCE.sendRequest(getUsersQuery, getUsersParams)) {
            while (rs != null && rs.next()) {
                Map<String, Object> user = new HashMap<>();
                user.put("profilePictureLink", rs.getString("profilePhotoUrl"));
                user.put("username", rs.getString("username"));
                user.put("email", rs.getString("email"));
                user.put("phone", rs.getString("phone"));
                user.put("role", rs.getString("role"));
                user.put("id", rs.getString("id"));
                usersList.add(user);
            }
        } catch (SQLException e) {
            logError("Error executing SQL request: " + getUsersQuery + ". Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to retrieve users list"));
        }

        return ResponseEntity.ok().body(usersList);
    }

    @GetMapping("/changeUserRole")
    public ResponseEntity<?> changeUserRole(
            @RequestHeader("userId") String userId,
            @RequestHeader("adminId") String adminId,
            @RequestHeader("newRole") String newRole) {
        System.out.println("Changing role for user " + userId + " to " + newRole);

        String adminIdFromSession = UserEndpoints.sessionMap.get(Util.getUuidOrNull(adminId));
        if (adminIdFromSession == null) {
             return ResponseEntity.ok().body(Map.of("msg", "error", "message", "Invalid user ID"));
        }

        if(Objects.equals(userId, adminIdFromSession)){
            return ResponseEntity.ok().body(Map.of("msg", "error", "message", "You cannot change your own role."));
        }

        String isAdminQuery = "SELECT role FROM users WHERE id = ?";
        Object[] isAdminParams = { adminIdFromSession };
        try (ResultSet rs = DatabaseHandler.INSTANCE.sendRequest(isAdminQuery, isAdminParams)) {
            if (rs == null || !rs.next() || !rs.getString("role").equalsIgnoreCase("admin")) {
                System.out.println("User with ID " + adminId + " is not authorized to change a user's role");
                return ResponseEntity.ok().body(Map.of("msg", "error", "message", "User unauthorized"));
            }
        } catch (SQLException e) {
            logError("Error executing SQL request: " + isAdminQuery + ". Error: " + e.getMessage());
            return ResponseEntity.ok().body(Map.of("msg", "error", "message", "An error occurred server-side"));
        }

        String updateUserRoleQuery = "UPDATE users SET role = ? WHERE id = ?";
        Object[] updateUserRoleParams = { newRole, userId };
        try {
            DatabaseHandler.INSTANCE.executeQuery(updateUserRoleQuery, updateUserRoleParams);
            return ResponseEntity.ok().body(Map.of("msg", "User role updated successfully"));
        } catch (SQLException e) {
            logError("Error executing SQL request: " + updateUserRoleQuery + ". Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to update user role"));
        }
    }

    @GetMapping("/delUserAdmin")
    public ResponseEntity<?> deleteUserByAdmin(
            @RequestHeader("adminID") String adminID,
            @RequestHeader("userID") String userID) {
        System.out.println("Admin with ID " + adminID + " is deleting user with ID: " + userID);

        String adminIdFromSession = UserEndpoints.sessionMap.get(Util.getUuidOrNull(adminID));
        if (adminIdFromSession == null) {
            return ResponseEntity.ok().body(Map.of("msg", "error", "message", "Invalid user ID"));
        }

        if(Objects.equals(userID, adminIdFromSession)){
            return ResponseEntity.ok().body(Map.of("msg", "error", "message", "You cannot delete yourself."));
        }

        String isAdminQuery = "SELECT role FROM users WHERE id = ?";
        Object[] isAdminParams = { adminIdFromSession };
        try (ResultSet rs = DatabaseHandler.INSTANCE.sendRequest(isAdminQuery, isAdminParams)) {
            if (rs == null || !rs.next() || !rs.getString("role").equalsIgnoreCase("admin")) {
                System.out.println("User with ID " + adminID + " is not authorized to delete a user");
                return ResponseEntity.ok().body(Map.of("msg", "error", "message", "User unauthorized"));
            }
        } catch (SQLException e) {
            logError("Error executing SQL request: " + isAdminQuery + ". Error: " + e.getMessage());
            return ResponseEntity.ok().body(Map.of("msg", "error", "message", "An error occurred server-side"));
        }

        String deleteUserQuery = "DELETE FROM users WHERE id = ?";
        Object[] deleteUserParams = { userID };
        try {
            DatabaseHandler.INSTANCE.executeQuery(deleteUserQuery, deleteUserParams);
            return ResponseEntity.ok().body(Map.of("msg", "User deleted successfully"));
        } catch (SQLException e) {
            logError("Error executing SQL request: " + deleteUserQuery + ". Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to delete user"));
        }
    }


    @GetMapping("/shutdown")
    public ResponseEntity<?> shutdownSystem(@RequestHeader("adminId") String adminID) {
        String adminIdFromSession = UserEndpoints.sessionMap.get(Util.getUuidOrNull(adminID));
        if (adminIdFromSession == null) {
            return ResponseEntity.ok().body(Map.of("msg", "error", "message", "Invalid user ID"));
        }



        String isAdminQuery = "SELECT role FROM users WHERE id = ?";
        Object[] isAdminParams = { adminIdFromSession };
        try (ResultSet rs = DatabaseHandler.INSTANCE.sendRequest(isAdminQuery, isAdminParams)) {
            if (rs == null || !rs.next() || !rs.getString("role").equalsIgnoreCase("admin")) {
                System.out.println("User with ID " + adminID + " is not authorized to delete a user");
                return ResponseEntity.ok().body(Map.of("msg", "error", "message", "User unauthorized"));
            }
        } catch (SQLException e) {
            logError("Error executing SQL request: " + isAdminQuery + ". Error: " + e.getMessage());
            return ResponseEntity.ok().body(Map.of("msg", "error", "message", "An error occurred server-side"));
        }

        log("Shutdown requested by admin user : %s", adminIdFromSession);


        new Thread(() ->{
            try {
                Thread.sleep(5000);
                System.exit(0);
            } catch (InterruptedException e) {
                throw new RuntimeException(e);
            }
        }).start();

        return ResponseEntity.ok().body(Map.of("msg", "success"));
    }

    @GetMapping("/restart")
    public ResponseEntity<?> restartSystem(@RequestHeader("adminId") String adminId) {
        System.out.println("System restart initiated by admin: " + adminId);
        return ResponseEntity.ok().body(Map.of("msg", "success"));
    }

}
