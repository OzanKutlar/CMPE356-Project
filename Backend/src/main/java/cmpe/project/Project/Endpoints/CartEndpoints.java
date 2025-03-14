package cmpe.project.Project.Endpoints;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.Map;

import static cmpe.project.Project.Utility.Util.logHeaders;


@RestController
@RequestMapping("/api/cart")
public class CartEndpoints {

    @GetMapping("/items")
    public ResponseEntity<?> getItems(@RequestHeader Map<String, String> headers) {
        logHeaders("items", headers);
        return ResponseEntity.ok().body(new ArrayList<>());
    }

    @GetMapping("/cart")
    public ResponseEntity<?> getCart(
            @RequestHeader(value = "userId", required = false) String userId) {
        System.out.println("Getting cart for user: " + userId);
        return ResponseEntity.ok().body(new ArrayList<>());
    }

    @GetMapping("/submitOrder")
    public ResponseEntity<?> submitOrder(
            @RequestHeader("userId") String userId,
            @RequestHeader(value = "orderDetails", required = false) String orderDetails) {
        System.out.println("Order submitted by user: " + userId);
        if (orderDetails != null) {
            System.out.println("Order details: " + orderDetails);
        }
        return ResponseEntity.ok().body("success");
    }

    @GetMapping("/cancelOrder")
    public ResponseEntity<?> cancelOrder(
            @RequestHeader("orderId") String orderId,
            @RequestHeader(value = "reason", required = false) String reason) {
        System.out.println("Cancelling order: " + orderId +
                (reason != null ? ", reason: " + reason : ""));
        return ResponseEntity.ok().body(Map.of("msg", "Your order has been cancelled successfully."));
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
            @RequestHeader(value = "quantity", defaultValue = "1") String quantity) {
        System.out.println("Adding to cart: user=" + userId + ", item=" + itemId +
                ", quantity=" + quantity);
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
