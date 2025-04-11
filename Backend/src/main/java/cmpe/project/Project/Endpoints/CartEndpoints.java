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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

    private static final Map<String, List<Map<String, Object>>> carts = new HashMap<>();

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
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to check user role"));
        }


        return ResponseEntity.ok().body(items);
    }

    @GetMapping("/cart")
    public ResponseEntity<?> getCart(
            @RequestHeader(value = "userId", required = false) String userId) {
        System.out.println("Getting cart for user: " + userId);
        List<Map<String, Object>> userCart = carts.getOrDefault(userId, new ArrayList<>());
        return ResponseEntity.ok().body(userCart);
    }

    @GetMapping("/submitOrder")
    public ResponseEntity<?> submitOrder(
            @RequestHeader("istemp") String istemp,
            @RequestHeader("phoneNo") String phoneNo,
            @RequestHeader("userId") String userId,
            @RequestHeader("items") String cartItemsJson,
            @RequestHeader("address") String address) {

        log("Processing order submission");
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            ArrayList<Map<String, Object>> cartItems = objectMapper.readValue(cartItemsJson, new TypeReference<>() {});

            // Validate cart items first
            boolean hasErrors = false;
            String errorMessage = "";

            // Check if cart is empty
            if (cartItems.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Cart is empty"));
            }

            // Track total price
            double totalPrice = 0;
            StringBuilder contentBuilder = new StringBuilder();

            // Validate each item and check stock availability
            for (Map<String, Object> cartItem : cartItems) {
                String productId = (String) cartItem.get("id");
                if (productId == null) {
                    log("Invalid cart item: missing product id");
                    hasErrors = true;
                    errorMessage = "Invalid cart item: missing product id";
                    break;
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
                        double itemPrice = price * amount;
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
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", errorMessage));
            }

            String content = contentBuilder.toString();

            String createDeliveryQuery = "INSERT INTO deliveries (address, istemp, totalPrice, content, status, assignedTo, phone_no, user_id, store_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

            String status = "pending";
            String assignedTo = "-1";
            String store_id = "1";


            Object[] deliveryParams = {address, istemp, totalPrice, content, status, assignedTo, phoneNo, userId, store_id};

            try {
                DatabaseHandler.INSTANCE.executeQuery(createDeliveryQuery, deliveryParams);
            } catch (SQLException e) {
                log("Failed to create delivery record: " + e.getMessage());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to create delivery record"));
            }

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
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to submit order"));
        }
    }


    @GetMapping("/cancelOrder")
    public ResponseEntity<?> cancelOrder(
            @RequestHeader("userID") String id,
            @RequestHeader("transactionID") String transactionID) {
        String userID = UserEndpoints.sessionMap.get(Util.getUuidOrNull(id));
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

    @GetMapping("/addToCart")
    public ResponseEntity<?> addToCart(
            @RequestHeader("userId") String userId,
            @RequestHeader("itemId") String itemId,
            @RequestHeader(value = "quantity", defaultValue = "1") String quantityStr) {

        System.out.println("Adding to cart: user=" + userId + ", item=" + itemId +
                ", quantity=" + quantityStr);

        int quantity = Integer.parseInt(quantityStr);

        carts.putIfAbsent(userId, new ArrayList<>());
        List<Map<String, Object>> userCart = carts.get(userId);

        boolean found = false;
        for (Map<String, Object> item : userCart) {
            if (item.get("itemId").equals(itemId)) {
                int currentQty = (int) item.get("quantity");
                item.put("quantity", currentQty + quantity);
                found = true;
                break;
            }
        }

        if (!found) {
            Map<String, Object> newItem = new HashMap<>();
            newItem.put("itemId", itemId);
            newItem.put("quantity", quantity);
            userCart.add(newItem);
        }

        return ResponseEntity.ok().body("success");
    }


    @GetMapping("/saveCart")
    public ResponseEntity<?> saveCart(
            @RequestHeader("items") String cartItemsJson) {
        log("Cart saved");
        try{
            ObjectMapper objectMapper = new ObjectMapper();
            ArrayList<Map<String, Object>> cartItems = objectMapper.readValue(cartItemsJson, new TypeReference<>() {});
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
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Invalid cart items"));
            }

            return ResponseEntity.ok().body(Map.of("msg", "success"));
        } catch(Exception e){
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to save cart"));
        }
    }
}
