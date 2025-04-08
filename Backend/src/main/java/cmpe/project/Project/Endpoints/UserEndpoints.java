package cmpe.project.Project.Endpoints;

import cmpe.project.Project.DatabaseHandler.DatabaseHandler;
import cmpe.project.Project.Utility.Util;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

        log("Recieved login request for user %s with password %s", username, password);

        String query = "SELECT id, profilePhotoUrl, username, email, phone, role FROM users WHERE username = ? AND password = ?";
        Object[] params = { username, password };
        Map<String, Object> user = null;
        try (ResultSet rs = DatabaseHandler.INSTANCE.sendRequest(query, params)) {
            if (rs != null && rs.next()) {
                user = new HashMap<>();
                user.put("profilePictureLink", rs.getString("profilePhotoUrl"));
                user.put("username", rs.getString("username"));
                user.put("email", rs.getString("email"));
                user.put("phone", rs.getString("phone"));
                user.put("role", rs.getString("role"));
                user.put("id", rs.getString("id"));
            }
        } catch (SQLException e) {
            logError("Error executing SQL request: " + query + ". Error: " + e.getMessage());
            e.printStackTrace();
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
    public ResponseEntity<?> deleteUser(@RequestHeader("userID") String userID) {

        // Check if the user exists in the session map
        String userIdFromSession = sessionMap.get(Util.getUuidOrNull(userID));
        log("User ID %s has requested a deletion themselves", userIdFromSession);
        if (userIdFromSession == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid user ID"));
        }


        String deleteUserQuery = "DELETE FROM users WHERE id = ?";
        Object[] deleteUserParams = { userIdFromSession };
        try {
            DatabaseHandler.INSTANCE.executeQuery(deleteUserQuery, deleteUserParams);
            return ResponseEntity.ok().body(Map.of("msg", "User deleted successfully"));
        } catch (SQLException e) {
            logError("Error executing SQL request: " + deleteUserQuery + ". Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to delete user"));
        }
    }

    @GetMapping("/registerUserPart")
    public ResponseEntity<?> registerUserPartial(
            @RequestHeader("username") String username,
            @RequestHeader("password") String password) {
        System.out.println("Partial registration: " + username + ", " + password);
        String query = "INSERT INTO users (username, password) VALUES (?, ?) RETURNING id";
        Object[] params = { username, password };
        try {
            ResultSet newUser = DatabaseHandler.INSTANCE.sendRequest(query, params);
            if (newUser.next()) { // Move the cursor to the first row
                UUID newID = UUID.randomUUID();
                String generatedId = newUser.getString("id");
                sessionMap.put(newID, generatedId);
                return ResponseEntity.ok().body(Map.of("msg", "success", "user", Map.of("id", newID.toString(), "username", username)));
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to register user partially"));
            }
        } catch (SQLException e) {
            logError("Error executing SQL request: " + query + ". Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to register user partially"));
        }
    }

    @GetMapping("/registerUserFull")
    public ResponseEntity<?> registerUserFull(
            @RequestHeader("userID") String userID,
            @RequestHeader("name") String name,
            @RequestHeader("surname") String surname,
            @RequestHeader("phone") String phone,
            @RequestHeader("country") String country,
            @RequestHeader("email") String email) {

        String id = sessionMap.get(Util.getUuidOrNull(userID));
        System.out.println("Full registration: " + id + ", " + email + ", " + phone.replaceAll("[^0-9+]", ""));
        String query = "UPDATE users SET name = ?, surname = ?, phone = ?, country = ?, email = ? WHERE id = ?";
        Object[] params = { name, surname, phone.replaceAll("[^0-9+]", ""), country, email, id };
        try {
            DatabaseHandler.INSTANCE.executeQuery(query, params);
        } catch (SQLException e) {
            logError("Error executing SQL request: " + query + ". Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to update user information"));
        }
        return ResponseEntity.ok().body(Map.of(
                "msg", "success",
                "user", Map.of(
                        "id", userID,
                        "profilePictureLink", "/src/assets/face1.jpg",
                        "email", email,
                        "phone", phone,
                        "role", "user"
                )
        ));
    }

    @GetMapping("/editUser")
    public ResponseEntity<?> editUser(@RequestHeader Map<String, Object> headers) {
        String name = (String) headers.get("name");
        String email = (String) headers.get("email");
        String dob = (String) headers.get("dob");
        String address = (String) headers.get("address");
        String phone = (String) headers.get("phone");
        String cardNumber = (String) headers.get("ccnumber");
        String cardExpiry = (String) headers.get("ccexpiry");
        String cardCvv = (String) headers.get("cccvv");
        String cardName = (String) headers.get("ccname");
        String userID = (String) headers.get("userid");
        String id = sessionMap.get(Util.getUuidOrNull(userID));

        System.out.println("User Modification: " + id + ", " + email + ", " + phone);

        String userQuery = "UPDATE users SET name = ?, email = ?, date_of_birth = ?, address = ?, phone = ? WHERE id = ?";
        Object[] userParams = {name, email, dob, address, phone, id};
        try {
            DatabaseHandler.INSTANCE.executeQuery(userQuery, userParams);
        } catch (SQLException e) {
            logError("Error executing user SQL request: " + userQuery + ". Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to update user information"));
        }

        if (cardName != null) {
            String cardQuery = "INSERT INTO credit_cards ( cardNumber, expirationDate, CVV, CardName, userID) VALUES (?, ?, ?, ?, ?)";
            Object[] cardParams = {cardNumber, cardExpiry, cardCvv, cardName, id};
            try {
                DatabaseHandler.INSTANCE.executeQuery(cardQuery, cardParams);
            } catch (SQLException e) {
                logError("Error executing card SQL request: " + cardQuery + ". Error: " + e.getMessage());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to update credit card information"));
            }
        }

        return ResponseEntity.ok().body(Map.of(
                "msg", "success"
        ));
    }


    @GetMapping("/cancelOrder")
    public ResponseEntity<?> cancelOrder(
            @RequestHeader("userID") String id,
            @RequestHeader("transactionID") String transactionID) {
        String userID = sessionMap.get(Util.getUuidOrNull(id));
        log("User %s has requested their order no %s to be cancelled", userID, transactionID);
        if (!checkUserTransaction(userID, transactionID)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Invalid user or transaction ID"));
        }

        String cancelOrderQuery = "UPDATE userOrders SET status = 'Cancelled' WHERE userID = ? AND order_id = ?";
        Object[] cancelParams = {userID, transactionID};

        try {
            ResultSet rs = DatabaseHandler.INSTANCE.sendRequest(cancelOrderQuery, cancelParams);
            return ResponseEntity.ok().body(Map.of("msg", "Your order has been cancelled successfully."));
        } catch (SQLException e) {
            e.printStackTrace();
            logError("Error executing cancel order SQL request: " + cancelOrderQuery + ". Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to cancel the order"));
        }
    }

    public boolean checkUserTransaction(String userID, String transactionID) {
        // Example logic to check if the transaction and user are valid
        String checkTransactionQuery = "SELECT COUNT(*) FROM userOrders WHERE userID = ? AND order_id = ?";
        Object[] queryParams = {userID, transactionID};

        try (ResultSet rs = DatabaseHandler.INSTANCE.sendRequest(checkTransactionQuery, queryParams)) {
            if (rs != null && rs.next()) {
                int count = rs.getInt(1);
                return count > 0;
            }
        } catch (SQLException e) {
            e.printStackTrace();
            logError("Error checking user transaction: " + checkTransactionQuery + ". Error: " + e.getMessage());
        }

        return false;
    }



    @GetMapping("/getOrders")
    public ResponseEntity<?> getOrders(
            @RequestHeader("userID") String userID,
            @RequestHeader("limit") int limit,
            @RequestHeader("pos") int pos) {




        String userIdFromSession = UserEndpoints.sessionMap.get(Util.getUuidOrNull(userID));
        if (userIdFromSession == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid user ID"));
        }

        log("User %s requested their orders. From %s to %s", userIdFromSession, pos, pos + limit);


        String getOrdersQuery = "SELECT * FROM userOrders WHERE userID = ? LIMIT ?, ?";
        Object[] queryParams = { userIdFromSession, pos, limit };
        List<Map<String, Object>> ordersList = new ArrayList<>();
        try (ResultSet rs = DatabaseHandler.INSTANCE.sendRequest(getOrdersQuery, queryParams)) {
            while (rs != null && rs.next()) {
                Map<String, Object> order = new HashMap<>();
                order.put("id", rs.getString("order_id"));
                order.put("address", rs.getString("address"));
                order.put("itemName", rs.getString("itemName"));
                order.put("itemPhoto", rs.getString("itemPhoto"));
                order.put("paymentMethod", rs.getString("paymentMethod"));
                order.put("paymentID", rs.getString("paymentID"));
                order.put("status", rs.getString("status"));
                try{
                    order.put("totalPrice", Double.parseDouble(rs.getString("totalPrice")));
                }
                catch(Exception e){
                    order.put("totalPrice", 0.00d);
                }
                ordersList.add(order);
            }
        } catch (SQLException e) {
            e.printStackTrace();
            logError("Error executing SQL request: " + getOrdersQuery + ". Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to check user role"));
        }


        return ResponseEntity.ok().body(ordersList);
    }





}
