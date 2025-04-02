package cmpe.project.Project.Endpoints;

import cmpe.project.Project.DatabaseHandler.DatabaseHandler;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.*;

import static cmpe.project.Project.Utility.Logger.*;

@RestController
@RequestMapping("/api/user")
public class UserEndpoints {

    public static HashMap<UUID, String> sessionMap = new HashMap<>();

    @GetMapping("/check-user")
    public ResponseEntity<?> checkUser(@RequestHeader("username") String username) {
        System.out.println("Received check-user request with username: " + username);

        // Check if the username exists in the database
        String query = "SELECT EXISTS(SELECT 1 FROM users WHERE username = ?)";
        Object[] params = { username };

        boolean userExists = false;
        try (ResultSet rs = DatabaseHandler.INSTANCE.sendRequest(query, params)) {
            if (rs != null && rs.next()) {
                userExists = rs.getBoolean(1);
            }
        } catch (SQLException e) {
            logError("Error executing SQL request: " + query + ". Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to check user existence"));
        }

        return ResponseEntity.ok().body(Map.of("exists", userExists));
    }

    @GetMapping("/login")
    public ResponseEntity<?> login(
            @RequestHeader("username") String username,
            @RequestHeader(value = "password", required = false) String password) {
        System.out.println("Received login request for user: " + username);

        String query = "SELECT id, profilePictureLink, email, phone, role FROM users WHERE username = ?";
        Object[] params = { username };
        Map<String, Object> user = null;
        try (ResultSet rs = DatabaseHandler.INSTANCE.sendRequest(query, params)) {
            if (rs != null && rs.next()) {
                user = new HashMap<>();
                user.put("profilePictureLink", rs.getString("profilePictureLink"));
                user.put("username", rs.getString("username"));
                user.put("email", rs.getString("email"));
                user.put("phone", rs.getString("phone"));
                user.put("role", rs.getString("role"));
            }
        } catch (SQLException e) {
            logError("Error executing SQL request: " + query + ". Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to retrieve user details"));
        }

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not found"));
        }

        UUID sessionUUID = UUID.randomUUID();
        sessionMap.put(sessionUUID, user.get("id").toString());
        user.put("id", sessionUUID);

        return ResponseEntity.ok().body(Map.of("msg", "success", "user", user));
    }

    @GetMapping("/delUser")
    public ResponseEntity<?> deleteUser(@RequestHeader("userId") String userId) {
        System.out.println("Deleting user: " + userId);
        return ResponseEntity.ok().body(Map.of("msg", "success"));
    }

    @GetMapping("/registerUserPart")
    public ResponseEntity<?> registerUserPartial(
            @RequestHeader("username") String username,
            @RequestHeader("email") String email) {
        System.out.println("Partial registration: " + username + ", " + email);

        // Generate a new UUID for the user ID
        UUID userId = UUID.randomUUID();
        String query = "INSERT INTO users (id, username, email) VALUES (?, ?, ?)";
        Object[] params = { userId.toString(), username, email };

        try {
            DatabaseHandler.INSTANCE.executeQuery(query, params);
        } catch (SQLException e) {
            logError("Error executing SQL request: " + query + ". Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to register user partially"));
        }

        return ResponseEntity.ok().body(Map.of("msg", "success", "user", Map.of("id", userId.toString(), "username", username)));
    }

    @GetMapping("/registerUserFull")
    public ResponseEntity<?> registerUserFull(
            @RequestHeader("userID") String id,
            @RequestHeader("name") String name,
            @RequestHeader("surname") String surname,
            @RequestHeader("phone") String phone,
            @RequestHeader("countryCode") String countryCode,
            @RequestHeader("email") String email,
            @RequestHeader("password") String password) {
        System.out.println("Full registration: " + id + ", " + email + ", " + phone);

        String query = "UPDATE users SET name = ?, surname = ?, phone = ?, countryCode = ?, email = ?, password = ? WHERE id = ?";
        Object[] params = { name, surname, phone, countryCode, email, password, id };
        try {
            DatabaseHandler.INSTANCE.executeQuery(query, params);
        } catch (SQLException e) {
            logError("Error executing SQL request: " + query + ". Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to update user information"));
        }
        return ResponseEntity.ok().body(Map.of("msg", "success", "user", Map.of("id", id, "name", name, "surname", surname)));
    }


    @GetMapping("/getOrders")
    public ResponseEntity<?> getOrders(
            @RequestHeader(value = "status", required = false) String status) {
        System.out.println("Getting orders" +
                (status != null ? " with status: " + status : ""));
        return ResponseEntity.ok().body(new ArrayList<>());
    }


    @GetMapping("/orders")
    public ResponseEntity<?> getAllOrders(
            @RequestHeader(value = "filterBy", required = false) String filterBy) {
        System.out.println("Getting all orders" +
                (filterBy != null ? " filtered by: " + filterBy : ""));
        return ResponseEntity.ok().body(Map.of("Waiting Orders", new ArrayList<>(),
                "Taken Orders", new ArrayList<>()));
    }



    @GetMapping("/getUsers")
    public ResponseEntity<?> getUsers(
            @RequestHeader("userID") String userID,
            @RequestHeader(value = "roleFilter", required = false) String roleFilter) {
        System.out.println("Getting users" +
                (roleFilter != null ? " with role: " + roleFilter : ""));

        String userIdFromSession = sessionMap.get(UUID.fromString(userID));
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


        String getUsersQuery = "SELECT id, username, email, phone, role FROM users";
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
                user.put("id", rs.getString("id"));
                user.put("username", rs.getString("username"));
                user.put("email", rs.getString("email"));
                user.put("phone", rs.getString("phone"));
                user.put("role", rs.getString("role"));
                usersList.add(user);
            }
        } catch (SQLException e) {
            logError("Error executing SQL request: " + getUsersQuery + ". Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to retrieve users list"));
        }

        return ResponseEntity.ok().body(usersList);
    }

}
