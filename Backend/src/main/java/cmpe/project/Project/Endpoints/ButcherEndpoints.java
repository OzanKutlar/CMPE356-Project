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

import static cmpe.project.Project.Endpoints.UserEndpoints.capitalizeFirstLetter;
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

    @GetMapping("/getOrders")
    public ResponseEntity<?> getOrders(
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

        log("User %s requested their orders. From %s to %s", userIdFromSession, pos, pos + limit);

        //String getOrdersQuery = "SELECT * FROM userOrders WHERE userID = ? LIMIT ?, ?";
        String query = """
                SELECT
                    o.order_id,
                    o.customer_id,
                    o.address,
                    pa.payment_method,
                    pa.transaction_id,
                    os.status,
                    p_max.name AS most_expensive_product_name,
                    p_max.photo AS most_expensive_product_photo,
                    SUM(oi.price) AS total_price
                FROM orders o
                JOIN order_splits os ON o.order_id = os.order_id
                JOIN order_items oi ON os.split_id = oi.split_id
                JOIN products p ON oi.product_id = p.product_id
                JOIN payments pa ON os.payment_id = pa.payment_id

                -- subquery for most expensive item
                JOIN (
                    SELECT 
                        o2.order_id,
                        p2.name,
                        p2.photo
                    FROM order_splits os2
                    JOIN orders o2 ON os2.order_id = o2.order_id
                    JOIN order_items oi2 ON os2.split_id = oi2.split_id
                    JOIN products p2 ON oi2.product_id = p2.product_id
                    WHERE (o2.order_id, oi2.price) IN (
                        SELECT o3.order_id, MAX(oi3.price)
                        FROM order_splits os3
                        JOIN orders o3 ON os3.order_id = o3.order_id
                        JOIN order_items oi3 ON os3.split_id = oi3.split_id
                        GROUP BY o3.order_id
                    )
                ) AS p_max ON p_max.order_id = o.order_id

                WHERE o.customer_id = ?
                GROUP BY o.order_id
                LIMIT ?, ?
                """;
        Object[] queryParams = { userIdFromSession, pos, limit };
        List<Map<String, Object>> ordersList = new ArrayList<>();
        try (ResultSet rs = DatabaseHandler.INSTANCE.sendRequest(query, queryParams)) {
            while (rs != null && rs.next()) {
                Map<String, Object> order = new HashMap<>();
                order.put("id", rs.getString("order_id"));
                order.put("address", rs.getString("address"));
                order.put("itemName", rs.getString("most_expensive_product_name"));
                order.put("itemPhoto", rs.getString("most_expensive_product_photo"));
                order.put("paymentMethod", rs.getString("payment_method"));
                order.put("paymentID", rs.getString("transaction_id"));
                order.put("status", capitalizeFirstLetter(rs.getString("status")));
                try{
                    order.put("totalPrice", Double.parseDouble(rs.getString("total_price")));
                }
                catch(Exception e){
                    order.put("totalPrice", 0.00d);
                }
                ordersList.add(order);
            }
        } catch (SQLException e) {
            e.printStackTrace();
            logError("Error executing SQL request: " + query + ". Error: " + e.getMessage());
            return ResponseEntity.ok().body(Map.of(
                    "msg", "error",
                    "message", "Internal Server Error"
            ));
        }


        return ResponseEntity.ok().body(ordersList);
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

        log("User %s requested their transactions. From %s to %s", userIdFromSession, pos, pos + limit);

        String getTransactionsQuery = """
                SELECT
                    o.order_id,
                    o.customer_id,
                    o.address,
                    pa.payment_method,
                    pa.transaction_id,
                    os.status,
                    p_max.name AS most_expensive_product_name,
                    p_max.photo AS most_expensive_product_photo,
                    SUM(oi.price) AS total_price
                FROM orders o
                JOIN order_splits os ON o.order_id = os.order_id
                JOIN order_items oi ON os.split_id = oi.split_id
                JOIN products p ON oi.product_id = p.product_id
                JOIN payments pa ON os.payment_id = pa.payment_id

                -- subquery for most expensive item
                JOIN (
                    SELECT 
                        o2.order_id,
                        p2.name,
                        p2.photo
                    FROM order_splits os2
                    JOIN orders o2 ON os2.order_id = o2.order_id
                    JOIN order_items oi2 ON os2.split_id = oi2.split_id
                    JOIN products p2 ON oi2.product_id = p2.product_id
                    WHERE (o2.order_id, oi2.price) IN (
                        SELECT o3.order_id, MAX(oi3.price)
                        FROM order_splits os3
                        JOIN orders o3 ON os3.order_id = o3.order_id
                        JOIN order_items oi3 ON os3.split_id = oi3.split_id
                        GROUP BY o3.order_id
                    )
                ) AS p_max ON p_max.order_id = o.order_id

                WHERE os.store_id = ?
                GROUP BY o.order_id
                ORDER BY o.order_id DESC
                LIMIT ?, ?
                """;
        Object[] queryParams = { storeID, pos, limit };
        List<Map<String, Object>> transactionsList = new ArrayList<>();

        try (ResultSet rs = DatabaseHandler.INSTANCE.sendRequest(getTransactionsQuery, queryParams)) {
            while (rs != null && rs.next()) {
                Map<String, Object> order = new HashMap<>();
                order.put("id", rs.getString("order_id"));
                order.put("address", rs.getString("address"));
                order.put("itemName", rs.getString("most_expensive_product_name"));
                order.put("itemPhoto", rs.getString("most_expensive_product_photo"));
                order.put("paymentMethod", rs.getString("payment_method"));
                order.put("paymentID", rs.getString("transaction_id"));
                order.put("status", capitalizeFirstLetter(rs.getString("status")));
                try{
                    order.put("totalPrice", Double.parseDouble(rs.getString("total_price")));
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

