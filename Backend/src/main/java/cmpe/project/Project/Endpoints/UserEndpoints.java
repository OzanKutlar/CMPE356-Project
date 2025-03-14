package cmpe.project.Project.Endpoints;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserEndpoints {

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

    @GetMapping("/getOrders")
    public ResponseEntity<?> getOrders(
            @RequestHeader(value = "status", required = false) String status) {
        System.out.println("Getting orders" +
                (status != null ? " with status: " + status : ""));
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


    @GetMapping("/getUsers")
    public ResponseEntity<?> getUsers(
            @RequestHeader(value = "roleFilter", required = false) String roleFilter) {
        System.out.println("Getting users" +
                (roleFilter != null ? " with role: " + roleFilter : ""));
        return ResponseEntity.ok().body(new ArrayList<>());
    }

}
