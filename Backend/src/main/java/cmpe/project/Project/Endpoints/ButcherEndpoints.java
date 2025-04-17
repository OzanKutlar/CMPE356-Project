package cmpe.project.Project.Endpoints;

import cmpe.project.Project.DatabaseHandler.DatabaseHandler;
import cmpe.project.Project.Utility.Util;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static cmpe.project.Project.Utility.Logger.*;
import static cmpe.project.Project.Utility.Util.*;

@RestController
@RequestMapping("/api/butcher")
public class ButcherEndpoints {


    public boolean checkButcherAllowed(String userID, String transactionID) {
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

    @GetMapping("/refundTransaction")
    public ResponseEntity<?> refundOrder(
            @RequestHeader("userID") String id,
            @RequestHeader("transactionID") String transactionID) {

        String userID = UserEndpoints.sessionMap.get(Util.getUuidOrNull(id));

        String isManager = "SELECT storeID FROM managers WHERE userID = ?";
        Object[] params = { userID };
        String storeID = "";

        try (ResultSet rs = DatabaseHandler.INSTANCE.sendRequest(isManager, params)) {
            if (rs == null || !rs.next()) {
                System.out.println("User with ID " + userID + " is not authorized to get stock of this store");
                return ResponseEntity.ok().body(Map.of(
                        "msg", "error",
                        "message", "User is not authorized"
                ));
            }

            storeID = rs.getString("storeID");
            System.out.println("Authorized manager for store ID: " + storeID);

        } catch (SQLException e) {
            logError("Error executing SQL request: " + isManager + ". Error: " + e.getMessage());
            return ResponseEntity.ok().body(Map.of(
                    "msg", "error",
                    "message", "Failed to check user role"
            ));
        }

//
//        log("User %s has requested a refund for transaction no %s", userID, transactionID);
//
//        if (!checkButcherAllowed(userID, transactionID)) {
//            return ResponseEntity.ok().body(Map.of(
//                    "msg", "error",
//                    "message", "Invalid user or transaction ID"
//            ));
//        }

        String refundQuery = "UPDATE userOrders SET status = 'Refunded' WHERE AND order_id = ?";
        Object[] refundParams = {transactionID};

        try {
            int updated = DatabaseHandler.INSTANCE.executeQuery(refundQuery, refundParams);
            if(updated > 0) {
                return ResponseEntity.ok().body(Map.of(
                        "msg", "success",
                        "message", "Your order has been refunded successfully."
                ));
            }
            else{
                return ResponseEntity.ok().body(Map.of(
                        "msg", "error",
                        "message", "Incorrect order_id."
                ));
            }
        } catch (SQLException e) {
            e.printStackTrace();
            logError("Error executing refund order SQL request: " + refundQuery + ". Error: " + e.getMessage());
            return ResponseEntity.ok().body(Map.of(
                    "msg", "error",
                    "message", "Failed to process the refund."
            ));
        }
    }

    @GetMapping("/banUser")
    public ResponseEntity<?> banUser(@RequestHeader Map<String, String> headers) {
        logHeaders("banUser", headers);
        return ResponseEntity.ok().body(Map.of("msg", "success"));
    }
    @GetMapping("/banAddress")
    public ResponseEntity<?> banAddress(@RequestHeader Map<String, String> headers) {
        logHeaders("banAddress", headers);
        return ResponseEntity.ok().body(Map.of("msg", "success"));
    }

    @GetMapping("/getTransactions")
    public ResponseEntity<?> getTransactions(
            @RequestHeader("userID") String userID,
            @RequestHeader("limit") int limit,
            @RequestHeader("pos") int pos) {

        String userIdFromSession = UserEndpoints.sessionMap.get(Util.getUuidOrNull(userID));
        if (userIdFromSession == null) {
            return ResponseEntity.ok().body(Map.of(
                    "msg", "error",
                    "message", "Invalid UserID"
            ));
        }

        log("User %s requested their transactions. From %s to %s", userIdFromSession, pos, pos + limit);

        String getTransactionsQuery = "SELECT * FROM userOrders WHERE userID = ? ORDER BY timestamps DESC LIMIT ?, ?";
        Object[] queryParams = { userIdFromSession, pos, limit };
        List<Map<String, Object>> transactionsList = new ArrayList<>();

        try (ResultSet rs = DatabaseHandler.INSTANCE.sendRequest(getTransactionsQuery, queryParams)) {
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
                transactionsList.add(order);
            }
        } catch (SQLException e) {
            e.printStackTrace();
            return ResponseEntity.ok().body(Map.of(
                    "msg", "error",
                    "message", "Internal Server Error"
            ));
        }

        return ResponseEntity.ok().body(transactionsList);
    }

    @GetMapping("/getRecipes")
    public ResponseEntity<?> getRecipes(@RequestHeader Map<String, String> headers) {
        logHeaders("getRecipes", headers);
        return ResponseEntity.ok().body(new ArrayList<>()); // Placeholder
    }

    @PostMapping("/addItem")
    public ResponseEntity<?> addItem(@RequestHeader("userID") String frontEndID,
                                     @RequestBody Map<String, Object> product){

        String realID = UserEndpoints.sessionMap.get(Util.getUuidOrNull(frontEndID));

        String isManager = "SELECT storeID FROM managers WHERE userID = ?";
        Object[] params = { realID };
        String storeID = "";

        try (ResultSet rs = DatabaseHandler.INSTANCE.sendRequest(isManager, params)) {
            if (rs == null || !rs.next()) {
                System.out.println("User with ID " + realID + " is not a manager");
                return ResponseEntity.ok().body(Map.of(
                        "msg", "error",
                        "message", "Only managers can add products"
                ));
            }

            storeID = rs.getString("storeID");
            System.out.println("Authorized manager for store ID: " + storeID);

        } catch (SQLException e) {
            logError("Error executing SQL request: " + isManager + ". Error: " + e.getMessage());
            return ResponseEntity.ok().body(Map.of(
                    "msg", "error",
                    "message", "Failed to check user role"
            ));
        }


        String query = "INSERT INTO products (store_id, name, price_per_kg, photo, currentStock, soldStock, category_id) VALUES (?, ?, ?, ?, ?, ?, ?)";
        params = new Object[]{storeID, product.get("ItemName"), product.get("ItemPrice"), product.get("ItemPhotoLink"), product.get("currentStock"), 0, 0};

        try {
            DatabaseHandler.INSTANCE.executeQuery(query, params);
        } catch (SQLException e) {
            logError("Error executing card SQL request: " + query + ". Error: " + e.getMessage());
            return ResponseEntity.ok().body(Map.of(
                    "msg", "error",
                    "message", "Failed to add your item"
            ));

        }

        return ResponseEntity.ok().body(Map.of(
                "msg", "ok",
                "message", "Item Added succesfully."
        ));
    }

    @GetMapping("/updateStock")
    public ResponseEntity<?> updateStock(@RequestHeader("userID") String userID,
                                         @RequestHeader("itemID") String productID,
                                         @RequestHeader("amount") String amount) {

        String userIdFromSession = UserEndpoints.sessionMap.get(Util.getUuidOrNull(userID));
        if (userIdFromSession == null) {
            return ResponseEntity.ok().body(Map.of(
                    "msg", "error",
                    "message", "Invalid user ID"
            ));
        }

        String isManager = "SELECT storeID FROM managers WHERE userID = ?";
        Object[] params = { userIdFromSession };
        String storeID = "";

        try (ResultSet rs = DatabaseHandler.INSTANCE.sendRequest(isManager, params)) {
            if (rs == null || !rs.next()) {
                System.out.println("User with ID " + userIdFromSession + " is not authorized to get stock of this store");
                return ResponseEntity.ok().body(Map.of(
                        "msg", "error",
                        "message", "User is not authorized"
                ));
            }

            storeID = rs.getString("storeID");
            System.out.println("Authorized manager for store ID: " + storeID);

        } catch (SQLException e) {
            logError("Error executing SQL request: " + isManager + ". Error: " + e.getMessage());
            return ResponseEntity.ok().body(Map.of(
                    "msg", "error",
                    "message", "Failed to check user role"
            ));
        }

        String getOrdersQuery = "SELECT store_id FROM products WHERE product_id = ?;";
        Object[] queryParams = { productID };
        try (ResultSet rs = DatabaseHandler.INSTANCE.sendRequest(getOrdersQuery, queryParams)) {
            while (rs != null && rs.next()) {
                if(!storeID.equals(rs.getString("store_id"))){
                    return ResponseEntity.ok().body(Map.of(
                            "msg", "error",
                            "message", "You are not authorized to work on this store."
                    ));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
            logError("Error executing SQL request: " + getOrdersQuery + ". Error: " + e.getMessage());
            return ResponseEntity.ok().body(Map.of(
                    "msg", "error",
                    "message", "Failed to check user auth"
            ));
        }


        String userQuery = "UPDATE products SET currentStock = ? WHERE product_id = ?";
        Object[] userParams = {amount, productID};
        try {
            DatabaseHandler.INSTANCE.executeQuery(userQuery, userParams);
        } catch (SQLException e) {
            logError("Error executing user SQL request: " + userQuery + ". Error: " + e.getMessage());
            return ResponseEntity.ok().body(Map.of(
                    "msg", "error",
                    "message", "Failed to update user information"
            ));
        }

        log("Stock Updated for product %s by user %s", productID, userIdFromSession);


        return ResponseEntity.ok().body(Map.of("msg", "success"));
    }


    @GetMapping("/getStock")
   public ResponseEntity<?> getStock(@RequestHeader("userID") String userID) {


        String userIdFromSession = UserEndpoints.sessionMap.get(Util.getUuidOrNull(userID));
        if (userIdFromSession == null) {
            return ResponseEntity.ok().body(Map.of(
                    "msg", "error",
                    "message", "Invalid User ID"
            ));
        }


        String isManager = "SELECT storeID FROM managers WHERE userID = ?";
        Object[] params = { userIdFromSession };
        String storeID = "";

        try (ResultSet rs = DatabaseHandler.INSTANCE.sendRequest(isManager, params)) {
            if (rs == null || !rs.next()) {
                System.out.println("User with ID " + userIdFromSession + " is not authorized to get stock of this store");
                return ResponseEntity.ok().body(Map.of(
                        "msg", "error",
                        "message", "You do not have the authorization to access this data."
                ));
            }

            storeID = rs.getString("storeID");
            System.out.println("Authorized manager for store ID: " + storeID);

        } catch (SQLException e) {
            logError("Error executing SQL request: " + isManager + ". Error: " + e.getMessage());
            return ResponseEntity.ok().body(Map.of(
                    "msg", "error",
                    "message", "Internal Server Error"
            ));
        }


        log("User %s requested butcher stock.", userIdFromSession);


        List<Map<String, Object>> items = new ArrayList<>();

        String getOrdersQuery = "SELECT p.* FROM products p WHERE p.store_id IN (SELECT storeID FROM managers WHERE userID = ?);";
        Object[] queryParams = { userIdFromSession };
        try (ResultSet rs = DatabaseHandler.INSTANCE.sendRequest(getOrdersQuery, queryParams)) {
            while (rs != null && rs.next()) {
                Map<String, Object> item = new HashMap<>();
                item.put("ItemName", rs.getString("name"));
                item.put("id", rs.getString("product_id"));
                item.put("ItemPhotoLink", rs.getString("photo"));
                item.put("currentStock", rs.getString("currentStock"));
                item.put("soldStock", rs.getString("soldStock"));
                try{
                    item.put("ItemPrice", Double.parseDouble(rs.getString("price_per_kg")));
                }
                catch(Exception e){
                    item.put("totalPrice", 0.00d);
                }
                items.add(item);
            }
        } catch (SQLException e) {
            e.printStackTrace();
            logError("Error executing SQL request: " + getOrdersQuery + ". Error: " + e.getMessage());
            return ResponseEntity.ok().body(Map.of(
                    "msg", "error",
                    "message", "Internal Server Error"
            ));
        }



        return ResponseEntity.ok().body(items);
    }


    @GetMapping("/getMostProfits")
    public ResponseEntity<?> getMostProfits(@RequestHeader("userID") String userID) {

        String userIdFromSession = UserEndpoints.sessionMap.get(Util.getUuidOrNull(userID));
        if (userIdFromSession == null) {
            return ResponseEntity.ok().body(Map.of(
                    "msg", "error",
                    "message", "Invalid User ID"
            ));
        }

        String isManager = "SELECT storeID FROM managers WHERE userID = ?";
        Object[] params = { userIdFromSession };
        String storeID = "";
        try (ResultSet rs = DatabaseHandler.INSTANCE.sendRequest(isManager, params)) {
            if (rs == null || !rs.next()) {
                System.out.println("User with ID " + userIdFromSession + " is not authorized to get stock of this store");
                return ResponseEntity.ok().body(Map.of(
                        "msg", "error",
                        "message", "You do not have the authorization to access this data."
                ));
            }
            storeID = rs.getString("storeID");
            System.out.println("Authorized manager for store ID: " + storeID);
        } catch (SQLException e) {
            logError("Error executing SQL request: " + isManager + ". Error: " + e.getMessage());
            return ResponseEntity.ok().body(Map.of(
                    "msg", "error",
                    "message", "Internal Server Error"
            ));
        }

        log("User %s requested most profitable products.", userIdFromSession);

        List<Map<String, Object>> items = new ArrayList<>();
        String getOrdersQuery = "SELECT p.*, p.price_per_kg FROM products p WHERE p.store_id IN (SELECT storeID FROM managers WHERE userID = ?)" +
                " ORDER BY (p.soldStock * p.price_per_kg) DESC LIMIT 5;";
        Object[] queryParams = { userIdFromSession };
        try (ResultSet rs = DatabaseHandler.INSTANCE.sendRequest(getOrdersQuery, queryParams)) {
            while (rs != null && rs.next()) {
                Map<String, Object> item = new HashMap<>();
                item.put("ItemName", rs.getString("name"));
                item.put("id", rs.getString("product_id"));
                item.put("ItemPhotoLink", rs.getString("photo"));
                item.put("currentStock", rs.getString("currentStock"));
                item.put("soldStock", rs.getString("soldStock"));
                try{
                    item.put("totalProfit", Double.parseDouble(rs.getString("price_per_kg")) * Double.parseDouble((String) item.get("soldStock")) / 1000);
                }
                catch(Exception e){
                    item.put("totalProfit", 0.00d);
                }
                items.add(item);
            }
        } catch (SQLException e) {
            e.printStackTrace();
            logError("Error executing SQL request: " + getOrdersQuery + ". Error: " + e.getMessage());
            return ResponseEntity.ok().body(Map.of(
                    "msg", "error",
                    "message", "Internal Server Error"
            ));
        }

        return ResponseEntity.ok().body(items);
    }

}

