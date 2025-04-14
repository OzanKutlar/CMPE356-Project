package cmpe.project.Project.Endpoints;

import cmpe.project.Project.DTOs.CustomerOrderDTO;
import cmpe.project.Project.DatabaseHandler.DatabaseHandler;
import cmpe.project.Project.Services.OrderService;
import cmpe.project.Project.Utility.Util;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.*;
import java.util.stream.Collectors;

import static cmpe.project.Project.Utility.Logger.log;
import static cmpe.project.Project.Utility.Logger.logError;

@RestController
@RequestMapping("/api/cart")
public class CartEndpoints {

    @Autowired
    private OrderService orderService;


    @GetMapping("/items")
    public ResponseEntity<?> getItems(@RequestHeader Map<String, String> headers) {
        List<Map<String, Object>> items = new ArrayList<>();

        String getOrdersQuery = "SELECT * FROM products WHERE currentStock > 0";
        try (ResultSet rs = DatabaseHandler.INSTANCE.sendRequest(getOrdersQuery, null)) {
            while (rs != null && rs.next()) {
                Map<String, Object> item = new HashMap<>();
                item.put("ItemName", rs.getString("name"));
                item.put("id", rs.getString("product_id"));
                item.put("ItemPhotoLink", rs.getString("photo"));
                item.put("currentStock", rs.getString("currentStock"));
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
                    "message", "Failed to fetch items"
            ));
        }


        return ResponseEntity.ok().body(items);
    }


    @PostMapping("/submitOrder")
    public ResponseEntity<?> submitOrder(
            @RequestHeader("istemp") String istemp,
            @RequestHeader("phoneNo") String phoneNo,
            @RequestHeader("userId") String user,
            @RequestBody Map<String, String> body) {

        String cartItemsJson = body.get("items");
        String address = body.get("address");

        log("Processing order submission");
        String userId = UserEndpoints.sessionMap.get(Util.getUuidOrNull(user));
        if(userId == null) userId = "";
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            ArrayList<Map<String, Object>> cartItems = objectMapper.readValue(cartItemsJson, new TypeReference<>() {});

            // Validate cart items first
            boolean hasErrors = false;
            String errorMessage = "";

            // Check if cart is empty
            if (cartItems.isEmpty()) {
                return ResponseEntity.ok().body(Map.of(
                        "msg", "error",
                        "message", "Cart is empty"
                ));
            }

            // Track total price
            double totalPrice = 0;
            StringBuilder contentBuilder = new StringBuilder();

            String orderPhoto = null;

            // Validate each item and check stock availability
            for (Map<String, Object> cartItem : cartItems) {
                String productId = (String) cartItem.get("id");
                if (productId == null) {
                    log("Invalid cart item: missing product id");
                    hasErrors = true;
                    errorMessage = "Invalid cart item: missing product id";
                    break;
                }

                if(orderPhoto == null){
                    orderPhoto = (String) cartItem.get("ItemPhotoLink");
                }

                Object[] productParams = {productId};
                String getProductQuery = "SELECT currentStock, price_per_kg, name FROM products WHERE product_id = ?";

                try (ResultSet rs = DatabaseHandler.INSTANCE.sendRequest(getProductQuery, productParams)) {
                    if (rs == null || !rs.next()) {
                        log("Product not found: " + productId);
                        hasErrors = true;
                        errorMessage = "Product not found: " + productId;
                        break;
                    }

                    double currentStock = rs.getDouble("currentStock");
                    double price = rs.getDouble("price_per_kg");
                    String productName = rs.getString("name");

                    Object buyAmount = cartItem.get("buyAmount");
                    if (buyAmount == null) {
                        log("Invalid cart item: missing buyAmount");
                        hasErrors = true;
                        errorMessage = "Invalid cart item: missing buyAmount for " + productName;
                        break;
                    }

                    try {
                        double amount = Double.parseDouble(String.valueOf(buyAmount));
                        if (amount > currentStock) {
                            log("Not enough stock for item: %s", cartItem.get("ItemName"));
                            hasErrors = true;
                            errorMessage = "Not enough stock for item: " + productName;
                            break;
                        }

                        // Calculate item price and add to total
                        double itemPrice = price * amount / 1000;
                        totalPrice += itemPrice;

                        String suffix;

                        if(amount > 1000){
                            suffix = "kg's";
                        }
                        else if(amount == 1000){
                            suffix = "kg";
                        }
                        else{
                            suffix = "g's";
                        }
                        if(suffix.charAt(0) == 'k'){
                            amount = amount / 1000;
                        }

                        // Build content string
                        if (contentBuilder.length() > 0) {
                            contentBuilder.append(",");
                        }
                        contentBuilder.append(productName).append(" - ").append(amount).append(suffix);

                        log("Item %s added to order.", productName);
                    } catch (NumberFormatException e) {
                        log("Invalid buyAmount for item: %s", cartItem.get("ItemName"));
                        hasErrors = true;
                        errorMessage = "Invalid quantity format for " + productName;
                        break;
                    }
                } catch (SQLException e) {
                    log("Error getting product information: " + e.getMessage());
                    hasErrors = true;
                    errorMessage = "Database error: " + e.getMessage();
                    break;
                }
            }

            if (hasErrors) {
                return ResponseEntity.ok().body(Map.of(
                        "msg", "error",
                        "message", errorMessage
                ));
            }

            String content = contentBuilder.toString();

            String createDeliveryQuery = "INSERT INTO deliveries (address, istemp, totalPrice, content, status, assignedTo, phone_no, user_id, store_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

            String status = "Pending";
            String assignedTo = "-1";
            String store_id = "1";


            Object[] deliveryParams = {address, Boolean.parseBoolean(istemp) ? 1 : 0, totalPrice, content, status, assignedTo, phoneNo.replaceAll("[^0-9+]", ""), userId, store_id};

            long deliveryId = -1;
            try {
                // Execute the query and get the generated delivery ID
                deliveryId = DatabaseHandler.INSTANCE.executeQueryAndGetId(createDeliveryQuery, deliveryParams);
                if (deliveryId == -1) {
                    log("Failed to retrieve delivery ID");
                    return ResponseEntity.ok().body(Map.of(
                            "msg", "error",
                            "message", "Failed to create delivery record"
                    ));
                }
            } catch (SQLException e) {
                log("Failed to create delivery record: " + e.getMessage());
                return ResponseEntity.ok().body(Map.of(
                        "msg", "error",
                        "message", "Failed to create delivery record"
                ));
            }

            // Create entry in userOrders table
            try {
                // Get first item name from content for userOrders table
                String firstItemName = content.contains(",") ?
                        content.substring(0, content.indexOf("-") - 1) :
                        content.substring(0, content.indexOf("-") - 1);


                // Default payment information
                String paymentMethod = "Paid at door";
                String paymentID = "#" + generateRandomPaymentId();

                // Create user order
                String createOrderQuery = "INSERT INTO userOrders (userID, address, itemName, itemPhoto, paymentMethod, paymentID, status, totalPrice, delivery_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

                Object[] orderParams = {userId, address, firstItemName, orderPhoto, paymentMethod, paymentID, status, totalPrice, deliveryId};

                DatabaseHandler.INSTANCE.executeQuery(createOrderQuery, orderParams);
                log("Created user order with delivery_id: " + deliveryId);

            } catch (SQLException e) {
                log("Warning: Failed to create user order record: " + e.getMessage());
                // Continue with the process even if user order creation fails
            }

            // Update stock for each item
            for (Map<String, Object> cartItem : cartItems) {
                String productId = (String) cartItem.get("id");
                double amount = Double.parseDouble(String.valueOf(cartItem.get("buyAmount")));

                String updateStockQuery = "UPDATE products SET currentStock = currentStock - ? WHERE product_id = ?";
                try {
                    DatabaseHandler.INSTANCE.sendRequest(updateStockQuery, new Object[] {amount, productId});
                } catch (SQLException e) {
                    log("Warning: Failed to update stock for product " + productId + ": " + e.getMessage());
                }
            }

            return ResponseEntity.ok().body(Map.of(
                    "msg", "success"
            ));

        } catch (Exception e) {
            e.printStackTrace();
            log("Order submission failed: " + e.getMessage());
            return ResponseEntity.ok().body(Map.of(
                    "msg", "error",
                    "message", "Failed to submit order"
            ));}
    }

    // Helper method to generate a random payment ID
    private String generateRandomPaymentId() {
        return String.valueOf(100000000000L + (long) (Math.random() * 900000000000L));
    }


    @GetMapping("/cancelOrder")
    public ResponseEntity<?> cancelOrder(
            @RequestHeader("userID") String id,
            @RequestHeader("transactionID") String transactionID) {
        String userID = UserEndpoints.sessionMap.get(Util.getUuidOrNull(id));
        log("User %s has requested their order no %s to be cancelled", userID, transactionID);
        if (!checkUserTransaction(userID, transactionID)) {
            return ResponseEntity.ok().body(Map.of(
                    "msg", "error",
                    "message", "Invalid user or transaction ID"
            ));
        }

        String cancelOrderQuery = "UPDATE userOrders SET status = 'Cancelled' WHERE userID = ? AND order_id = ?";
        Object[] cancelParams = {userID, transactionID};

        try {
            ResultSet rs = DatabaseHandler.INSTANCE.sendRequest(cancelOrderQuery, cancelParams);
            return ResponseEntity.ok().body(Map.of(
                    "msg", "success",
                    "message", "Your order has been cancelled successfully."
            ));
        } catch (SQLException e) {
            e.printStackTrace();
            logError("Error executing cancel order SQL request: " + cancelOrderQuery + ". Error: " + e.getMessage());
            return ResponseEntity.ok().body(Map.of(
                    "msg", "error",
                    "message", "Failed to cancel the order"
            ));
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

    @GetMapping("/changeAddr")
    public ResponseEntity<?> changeAddress(
            @RequestHeader("userId") String userId,
            @RequestHeader("newAddress") String newAddress) {
        System.out.println("Address change for user " + userId + ": " + newAddress);
        return ResponseEntity.ok().body(Map.of("msg", "Your address change has been accepted."));
    }

    @GetMapping("/contDriver")
    public ResponseEntity<?> contactDriver(
            @RequestHeader("orderId") String orderId) {
        System.out.println("Contact driver request for order: " + orderId);
        return ResponseEntity.ok().body(Map.of("msg", "Your driver will contact you shortly."));
    }


    @PostMapping("/saveCart")
    public ResponseEntity<?> saveCart(
            @RequestBody Map<String, String> cartItemsJson) {
        log("Cart saved");
        try{
            ObjectMapper objectMapper = new ObjectMapper();
            ArrayList<Map<String, Object>> cartItems = objectMapper.readValue(cartItemsJson.get("items"), new TypeReference<>() {});
            boolean hasErrors = false;
            for (Map<String, Object> cartItem : cartItems) {
                String productId = (String) cartItem.get("id");
                if (productId == null) {
                    log("Invalid cart item: missing product id");
                    hasErrors = true;
                    break;
                }
                Object[] userParams = {productId};
                String getStockQuery = "SELECT currentStock FROM products WHERE product_id = ?";
                try (ResultSet rs = DatabaseHandler.INSTANCE.sendRequest(getStockQuery, userParams)) {
                    if (rs == null || !rs.next()) {
                        log("Product not found");
                        hasErrors = true;
                        break;
                    }
                    double currentStock = rs.getDouble("currentStock");
                    Object buyAmount = cartItem.get("buyAmount");
                    if (buyAmount == null) {
                        log("Invalid cart item: missing buyAmount");
                        hasErrors = true;
                        break;
                    }
                    try {
                        double amount = Double.parseDouble(String.valueOf(buyAmount));
                        if (amount > currentStock) {
                            log("Not enough stock for item: %s", cartItem.get("ItemName"));
                            hasErrors = true;
                            break;
                        }
                        log("Item %s is safely sent.", cartItem.get("ItemName"));
                    } catch (NumberFormatException e) {
                        log("Invalid buyAmount for item: %s", cartItem.get("ItemName"));
                        hasErrors = true;
                        break;
                    }
                } catch (SQLException e) {
                    log("Error getting stock information: " + e.getMessage());
                    hasErrors = true;
                    break;
                }
            }

            if (hasErrors) {
                return ResponseEntity.ok().body(Map.of(
                        "msg", "error",
                        "message", "Invalid cart items"
                ));
            }

            return ResponseEntity.ok().body(Map.of("msg", "success"));
        } catch(Exception e){
            e.printStackTrace();
            return ResponseEntity.ok().body(Map.of(
                    "msg", "error",
                    "message", "Failed to save cart"
            ));
        }
    }
}
