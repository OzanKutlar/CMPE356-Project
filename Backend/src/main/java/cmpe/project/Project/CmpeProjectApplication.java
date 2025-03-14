package cmpe.project.Project;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

@SpringBootApplication
@RestController
@RequestMapping("/api")
public class CmpeProjectApplication {

	public static void main(String[] args) {
		SpringApplication.run(CmpeProjectApplication.class, args);
	}

	@GetMapping("/hello")
	public String sayHello() {
		return "Hello, Haratres!";
	}

	@GetMapping("/check-user")
	public ResponseEntity<?> checkUser(@RequestHeader("username") String username) {
		// Implementation that uses the username header
		System.out.println("Received check-user request with username: " + username);
		return ResponseEntity.ok().body(Map.of("exists", true));
	}

	@GetMapping("/login")
	public ResponseEntity<?> login(
			@RequestHeader("username") String username,
			@RequestHeader(value = "password", required = false) String password) {
		System.out.println("Received login request for user: " + username);
		return ResponseEntity.ok().body(Map.of("msg", "success", "user", new Object()));
	}

	@GetMapping("/endpoint2")
	public ResponseEntity<?> getEndpoint2(@RequestHeader Map<String, String> headers) {
		// Process all headers
		headers.forEach((key, value) -> System.out.println(key + ": " + value));
		return ResponseEntity.ok().body(Map.of("data", "Data for Endpoint 2"));
	}

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

	@GetMapping("/getStock")
	public ResponseEntity<?> getStock(
			@RequestHeader(value = "categoryFilter", required = false) String categoryFilter) {
		System.out.println("Getting stock" +
				(categoryFilter != null ? " for category: " + categoryFilter : ""));
		return ResponseEntity.ok().body(new ArrayList<>());
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

	@GetMapping("/updateStock")
	public ResponseEntity<?> updateStock(
			@RequestHeader("itemId") String itemId,
			@RequestHeader("newQuantity") String newQuantity) {
		System.out.println("Updating stock for item " + itemId + " to " + newQuantity);
		return ResponseEntity.ok().body("success");
	}

	@GetMapping("/changeUserRole")
	public ResponseEntity<?> changeUserRole(
			@RequestHeader("userId") String userId,
			@RequestHeader("newRole") String newRole) {
		System.out.println("Changing role for user " + userId + " to " + newRole);
		return ResponseEntity.ok().body("success");
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

	@GetMapping("/delUser")
	public ResponseEntity<?> deleteUser(@RequestHeader("userId") String userId) {
		System.out.println("Deleting user: " + userId);
		return ResponseEntity.ok().body(Map.of("msg", "success"));
	}

	@GetMapping("/registerUserPart")
	public ResponseEntity<?> registerUserPartial(
			@RequestHeader("username") String username,
			@RequestHeader("email") String email) {
		System.out.println("Partial registration: " + username + ", " + email);
		return ResponseEntity.ok().body(Map.of("msg", "success", "user", new HashMap<>()));
	}

	@GetMapping("/registerUserFull")
	public ResponseEntity<?> registerUserFull(
			@RequestHeader("username") String username,
			@RequestHeader("email") String email,
			@RequestHeader("phone") String phone,
			@RequestHeader("role") String role) {
		System.out.println("Full registration: " + username + ", " + email +
				", " + phone + ", role: " + role);
		return ResponseEntity.ok().body(Map.of("msg", "success", "user", new HashMap<>()));
	}

	@GetMapping("/saveCart")
	public ResponseEntity<?> saveCart(
			@RequestHeader("userId") String userId,
			@RequestHeader("cartData") String cartData) {
		System.out.println("Saving cart for user: " + userId);
		System.out.println("Cart data: " + cartData);
		return ResponseEntity.ok().body("success");
	}

	@GetMapping("/getUsers")
	public ResponseEntity<?> getUsers(
			@RequestHeader(value = "roleFilter", required = false) String roleFilter) {
		System.out.println("Getting users" +
				(roleFilter != null ? " with role: " + roleFilter : ""));
		return ResponseEntity.ok().body(new ArrayList<>());
	}

	// Helper method to log headers
	private void logHeaders(String endpoint, Map<String, String> headers) {
		System.out.println("Request to " + endpoint + " with headers:");
		headers.forEach((key, value) -> System.out.println("  " + key + ": " + value));
	}

	// Remaining endpoints following the same pattern...
	@GetMapping("/saveButcher")
	public ResponseEntity<?> saveButcher(@RequestHeader Map<String, String> headers) {
		logHeaders("saveButcher", headers);
		return ResponseEntity.ok().body("success");
	}

	@GetMapping("/getMostProfits")
	public ResponseEntity<?> getMostProfits(
			@RequestHeader(value = "timeframe", required = false) String timeframe) {
		System.out.println("Getting most profits" +
				(timeframe != null ? " for timeframe: " + timeframe : ""));
		return ResponseEntity.ok().body(new ArrayList<>());
	}

	@GetMapping("/getTransactions")
	public ResponseEntity<?> getTransactions(
			@RequestHeader(value = "limit", defaultValue = "5") String limit) {
		System.out.println("Getting transactions with limit: " + limit);
		return ResponseEntity.ok().body(new ArrayList<>());
	}

	@GetMapping("/getOrders")
	public ResponseEntity<?> getOrders(
			@RequestHeader(value = "status", required = false) String status) {
		System.out.println("Getting orders" +
				(status != null ? " with status: " + status : ""));
		return ResponseEntity.ok().body(new ArrayList<>());
	}

	@GetMapping("/getRecipes")
	public ResponseEntity<?> getRecipes(
			@RequestHeader(value = "meatType", required = false) String meatType) {
		System.out.println("Getting recipes" +
				(meatType != null ? " for meat type: " + meatType : ""));
		return ResponseEntity.ok().body(new ArrayList<>());
	}

	@GetMapping("/orders")
	public ResponseEntity<?> getAllOrders(
			@RequestHeader(value = "filterBy", required = false) String filterBy) {
		System.out.println("Getting all orders" +
				(filterBy != null ? " filtered by: " + filterBy : ""));
		return ResponseEntity.ok().body(Map.of("Waiting Orders", new ArrayList<>(),
				"Taken Orders", new ArrayList<>()));
	}

}
