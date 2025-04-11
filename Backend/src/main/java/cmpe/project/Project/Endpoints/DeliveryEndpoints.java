package cmpe.project.Project.Endpoints;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cmpe.project.Project.Services.OrderService;

@RestController
@RequestMapping("/api/delivery")
public class DeliveryEndpoints {
    
    private final OrderService orderService;

    public DeliveryEndpoints(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping("/get-unassigned-orders")
    public ResponseEntity<?> GetUnassignedOrders() {
        try {
            return ResponseEntity.ok(orderService.GetUnassignedOrders());
        } catch (Exception e) {
            return ResponseEntity.ok().body("Failed to get unassigned orders: " + e.getMessage());
        }
    }

    @GetMapping("/get-assigned-orders/{userId}")
    public ResponseEntity<?> GetAssignedOrders(@PathVariable long userId) {
        try {
            return ResponseEntity.ok(orderService.GetAssignedOrdersFilterByDriver(userId));
        } catch (Exception e) {
            return ResponseEntity.ok().body("Failed to get assigned orders: " + e.getMessage());
        }
    }

    @PatchMapping("/assign-order/{userId}/{splitId}")
    public ResponseEntity<?> AssignOrder(@PathVariable long userId, @PathVariable long splitId) {
        try {
            orderService.AssignOrder(splitId, userId);
            return ResponseEntity.noContent().build();

        } catch (RuntimeException e) {
            return ResponseEntity.ok().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.ok().body("Failed to assign order: " + e.getMessage());
        }
    }

    @PatchMapping("/drop-order/{splitId}")
    public ResponseEntity<?> DropOrder(@PathVariable long splitId) {
        try {
            orderService.DropOrder(splitId);
            return ResponseEntity.ok().body("Success");
        } catch (Exception e) {
            return ResponseEntity.ok().body("Failed to drop order: " + e.getMessage());
        }
    }

    @PatchMapping("/complete-order/{splitId}")
    public ResponseEntity<?> CompleteOrder(@PathVariable long splitId) {
        try {
            orderService.CompleteOrder(splitId);
            return ResponseEntity.ok().body("Success");
        } catch (Exception e) {
            return ResponseEntity.ok().body("Failed to complete order: " + e.getMessage());
        }
    }


}
