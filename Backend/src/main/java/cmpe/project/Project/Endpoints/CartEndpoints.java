package cmpe.project.Project.Endpoints;

import cmpe.project.Project.DTOs.CustomerOrderDTO;
import cmpe.project.Project.DTOs.SplitOrderDTO;
import cmpe.project.Project.DatabaseHandler.DatabaseHandler;
import cmpe.project.Project.Repositories.OrderRepository;
import cmpe.project.Project.Services.OrderService;
import cmpe.project.Project.Utility.Util;
import cmpe.project.Project.Utility.CustomExceptions.SplitErrorException;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.MessagingException;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
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

    @GetMapping("/items/{storeId}")
    public ResponseEntity<?> getItems(@RequestHeader Map<String, String> headers, @PathVariable long storeId) {
        List<Map<String, Object>> items = new ArrayList<>();

        String getOrdersQuery = """
                SELECT
                    p.product_id,
                    p.name,
                    p.photo,
                    p.currentStock,
                    p.category,
                    p.price_per_kg,
                    p.store_id,
                    GROUP_CONCAT(DISTINCT CONCAT(ot.name, ':', ov.value) SEPARATOR '|') AS options
                FROM products p
                LEFT JOIN product_options po ON p.product_id = po.product_id
                LEFT JOIN option_values ov ON po.opt_val_id = ov.opt_val_id
                LEFT JOIN option_types ot ON ov.option_id = ot.option_id
                WHERE p.store_id = ?
                AND p.currentStock > 0
                GROUP BY p.product_id;
                """;
        Object[] params = {storeId};
        try (ResultSet rs = DatabaseHandler.INSTANCE.sendRequest(getOrdersQuery, params)) {
            while (rs != null && rs.next()) {
                Map<String, Object> item = new HashMap<>();
                item.put("ItemName", rs.getString("name"));
                item.put("id", rs.getString("product_id"));
                item.put("storeId", rs.getString("store_id"));
                item.put("ItemPhotoLink", rs.getString("photo"));
                item.put("currentStock", rs.getString("currentStock"));
                item.put("category", rs.getString("category").split(","));
                item.put("options", rs.getString("options"));
                try {
                    item.put("ItemPrice", rs.getDouble("price_per_kg"));
                } catch (Exception e) {
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
            @RequestHeader("userID") String user,
            @RequestBody CustomerOrderDTO newOrder) {

        log("Processing order submission");
        String userId = UserEndpoints.sessionMap.get(Util.getUuidOrNull(user));

        if (userId == null)
            userId = "";
        else{
            try{
                newOrder.setCustomerId(Long.parseLong(userId));
            }
            catch(Exception e){
            }
        }

        try {


            // Validate cart items first
            if (newOrder == null || !newOrder.selfValidation()) {
                log("Error: Empty cart or missing order information!");
                return ResponseEntity.ok().body(Map.of(
                        "msg", "error",
                        "message", "Cart is empty or the order is missing information"
                ));
            }

            orderService.calculateOrderCosts(newOrder);

            //simulate payment. if payment method is credit card, assume payment process was successful.
            boolean isPaid;
            if (newOrder.getPaymentMethod().equals("Credit Card")) {
                isPaid = true;
                newOrder.setTransactionId("#" + generateRandomPaymentId());
            } else {
                isPaid = false;
            }

            orderService.SubmitOrder(newOrder, isPaid);

        } catch (SQLException esql) {
            log("Error in the database operations: " + esql.getMessage());
            esql.printStackTrace();
            return ResponseEntity.ok().body(Map.of(
                    "msg", "error",
                    "message", "Failed to submit orderrrrr"
            ));

        } catch (SplitErrorException esplt) {
            log("Error in split information: " + esplt.getMessage());
            return ResponseEntity.ok().body(Map.of(
                    "msg", "error",
                    "message", "Invalid split information"
            ));

        } catch (MessagingException emsg) {
            log("Error: Failed to send websocket message!");
        }

        return ResponseEntity.ok(Util.JsonResponder("msg", "success"));
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
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            ArrayList<Map<String, Object>> cartItems = objectMapper.readValue(cartItemsJson.get("items"), new TypeReference<>() {
            });
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
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.ok().body(Map.of(
                    "msg", "error",
                    "message", "Failed to save cart"
            ));
        }
    }
}
