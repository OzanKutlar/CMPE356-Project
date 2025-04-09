package cmpe.project.Project.Endpoints;

import cmpe.project.Project.DatabaseHandler.DatabaseHandler;
import cmpe.project.Project.Utility.Util;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static cmpe.project.Project.Utility.Logger.log;
import static cmpe.project.Project.Utility.Logger.logError;
import static cmpe.project.Project.Utility.Util.logHeaders;

@RestController
@RequestMapping("/api/cart")
public class CartEndpoints {

    private static final Map<String, List<Map<String, Object>>> carts = new HashMap<>();

    @GetMapping("/items")
    public ResponseEntity<?> getItems(@RequestHeader Map<String, String> headers) {
        logHeaders("items", headers);

        List<Map<String, Object>> items = new ArrayList<>();

        Map<String, Object> item1 = new HashMap<>();
        item1.put("itemId", "101");
        item1.put("name", "Beef Cubes");
        item1.put("price", 249.99);

        Map<String, Object> item2 = new HashMap<>();
        item2.put("itemId", "102");
        item2.put("name", "Lamb Chops");
        item2.put("price", 329.99);

        items.add(item1);
        items.add(item2);

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
            @RequestHeader("userId") String userId,
            @RequestHeader(value = "orderDetails", required = false) String orderDetails) {
        System.out.println("Order submitted by user: " + userId);
        if (orderDetails != null) {
            System.out.println("Order details: " + orderDetails);
        }
        carts.remove(userId);
        return ResponseEntity.ok().body("success");
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
            @RequestHeader("userId") String userId,
            @RequestHeader("cartData") String cartData) {
        System.out.println("Saving cart for user: " + userId);
        System.out.println("Cart data: " + cartData);
        return ResponseEntity.ok().body("success");
    }
}
