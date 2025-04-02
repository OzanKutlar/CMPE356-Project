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
import java.util.Map;
import java.util.UUID;

import static cmpe.project.Project.Utility.Logger.logError;


@RestController
@RequestMapping("/api/admin")
public class AdminEndpoints {



    @GetMapping("/changeUserRole")
    public ResponseEntity<?> changeUserRole(
            @RequestHeader("userId") String userId,
            @RequestHeader("adminId") String adminId,
            @RequestHeader("newRole") String newRole) {
        System.out.println("Changing role for user " + userId + " to " + newRole);
        return ResponseEntity.ok().body("success");
    }

    @GetMapping("/delUserAdmin")
    public ResponseEntity<?> deleteUserByAdmin(
            @RequestHeader("adminID") String adminID,
            @RequestHeader("userID") String userID) {
        System.out.println("Admin with ID " + adminID + " is deleting user with ID: " + userID);

        // Check if the admin exists in the session map
        String adminIdFromSession = UserEndpoints.sessionMap.get(UUID.fromString(adminID));
        if (adminIdFromSession == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid admin ID"));
        }

        // Query the database to check if the admin is an admin
        String isAdminQuery = "SELECT role FROM users WHERE id = ?";
        Object[] isAdminParams = { adminIdFromSession };
        try (ResultSet rs = DatabaseHandler.INSTANCE.sendRequest(isAdminQuery, isAdminParams)) {
            if (rs == null || !rs.next() || !rs.getString("role").equalsIgnoreCase("admin")) {
                System.out.println("User with ID " + adminID + " is not authorized to delete a user");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Admin is not authorized"));
            }
        } catch (SQLException e) {
            logError("Error executing SQL request: " + isAdminQuery + ". Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to check admin role"));
        }

        // Delete the user from the database
        String deleteUserQuery = "DELETE FROM users WHERE id = ?";
        Object[] deleteUserParams = { userID };
        try {
            DatabaseHandler.INSTANCE.executeQuery(deleteUserQuery, deleteUserParams);
            UserEndpoints.sessionMap.remove(UUID.fromString(userID));
            return ResponseEntity.ok().body(Map.of("msg", "User deleted successfully"));
        } catch (SQLException e) {
            logError("Error executing SQL request: " + deleteUserQuery + ". Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to delete user"));
        }
    }

    // Continue with similar pattern for other endpoints
    @GetMapping("/shutdown")
    public ResponseEntity<?> shutdownSystem(@RequestHeader("adminId") String adminId) {
        System.out.println("System shutdown initiated by admin: " + adminId);
        return ResponseEntity.ok().body(Map.of("msg", "success"));
    }

    @GetMapping("/restart")
    public ResponseEntity<?> restartSystem(@RequestHeader("adminId") String adminId) {
        System.out.println("System restart initiated by admin: " + adminId);
        return ResponseEntity.ok().body(Map.of("msg", "success"));
    }

}
