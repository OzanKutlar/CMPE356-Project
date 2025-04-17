package cmpe.project.Project.Endpoints;

import cmpe.project.Project.DatabaseHandler.DatabaseHandler;
import cmpe.project.Project.Utility.Util;
import org.springframework.http.HttpStatus;
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


    /**
     * @param headers headers.get("userID") is a userID
     *                headers.get("items") is a list of items with the following structure :
     *                [
     *                {
     *                "name": "Antrikot",
     *                "photoLink": "/src/assets/antrikot.png",
     *                "pricePerKg": "13",
     *                "stock": "20"
     *                }
     *                ]
     *                <p>
     *                returns msg : success if it went ok. Returns the error message in msg if not.
     * @return
     */
    @GetMapping("/saveButcher")
    public ResponseEntity<?> saveButcher(@RequestHeader Map<String, String> headers) {
        logHeaders("saveButcher", headers);
        return ResponseEntity.ok().body(Map.of("msg", "success"));
    }

    /**
     * @param headers
     * header.userID (See above for explanation)
     *
     * should return the items that have generated the most profit to the seller based on their userID.
     * @return
     */
    @GetMapping("/getMostProfits")
     public ResponseEntity<?> getMostProfits(@RequestHeader Map<String, String> headers) {
        logHeaders("getMostProfits", headers);
        return ResponseEntity.ok().body(new ArrayList<>()); // Stub: Replace with actual logic
    }

    /**
     * The below three functions are practically identical, only returning a success or failure like saveButcher.
     *
     * @param headers
     * header.userID (See above for explanation)
     *
     * should return the items that have generated the most profit to the seller based on their userID.
     * @return
     */
    @GetMapping("/refundTransaction")
    public ResponseEntity<?> refundTransaction(@RequestHeader Map<String, String> headers) {
        logHeaders("refundTransaction", headers);
        return ResponseEntity.ok().body(Map.of("msg", "success"));
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

    /**
     * @param headers
     * header.userID (See above for explanation)
     * header.limit determines how many items should be returned. Start from the latest transaction.
     * header.pos determines which 'page' should be returned. If limit = 5 and pos = 0, the latest 5 transactions are returned, if limit = 5 and pos = 1
     *  the transactions from the 6th to the 10th are returned.
     * @return
     */
    @GetMapping("/getTransactions")
    public ResponseEntity<?> getTransactions(@RequestHeader Map<String, String> headers) {
        logHeaders("getTransactions", headers);
        return ResponseEntity.ok().body(new ArrayList<>());
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
                "message", "Failed to update user information"
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


    /**
     * headers has userid
     *
     * @param headers returns a list of how much of each item is left along with their initial stock count. in the following format :
     * [
     *   {
     *     ItemName: "Minced Meat",
     *     ItemPrice: 59.99,
     *     ItemPhotoLink: "https://static.ticimax.cloud/43437/uploads/urunresimleri/buyuk/kuzu-az-yagli-kiyma-1f-4f9.jpg",
     *     currentStock: 12,
     *     startStock: 30
     *   }
     * ]
     * @return
     */
    @GetMapping("/getStock")
   public ResponseEntity<?> getStock(@RequestHeader("userID") String userID) {


        String userIdFromSession = UserEndpoints.sessionMap.get(Util.getUuidOrNull(userID));
        if (userIdFromSession == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid user ID"));
        }


        String isManager = "SELECT storeID FROM managers WHERE userID = ?";
        Object[] params = { userIdFromSession };
        String storeID = "";

        try (ResultSet rs = DatabaseHandler.INSTANCE.sendRequest(isManager, params)) {
            if (rs == null || !rs.next()) {
                System.out.println("User with ID " + userIdFromSession + " is not authorized to get stock of this store");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User is not authorized"));
            }

            storeID = rs.getString("storeID");
            System.out.println("Authorized manager for store ID: " + storeID);

        } catch (SQLException e) {
            logError("Error executing SQL request: " + isManager + ". Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to check user role"));
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
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to check user role"));
        }



        return ResponseEntity.ok().body(items);
    }
}

