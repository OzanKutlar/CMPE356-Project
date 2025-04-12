package cmpe.project.Project.Endpoints;

import cmpe.project.Project.Utility.Util;

import java.util.UUID;

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
            return ResponseEntity.ok(Util.JsonResponder("Status", "Failed to get unassigned orders: " + e.getMessage()));
        }
    }

    @GetMapping("/get-assigned-orders/{uuid}")
    public ResponseEntity<?> GetAssignedOrders(@PathVariable UUID uuid) {
        try {
            return ResponseEntity.ok(orderService.GetAssignedOrdersFilterByDriver(Long.parseLong(UserEndpoints.sessionMap.get(uuid))));
        } catch (Exception e) {
            return ResponseEntity.ok(Util.JsonResponder("Status", "Failed to get assigned orders: " + e.getMessage()));
        }
    }

    //@PatchMapping
    @GetMapping("/assign-order/{uuid}/{splitId}")
    public ResponseEntity<?> AssignOrder(@PathVariable UUID uuid, @PathVariable long splitId) {
        try {
            orderService.AssignOrder(splitId, Long.parseLong(UserEndpoints.sessionMap.get(uuid)));
            //return ResponseEntity.noContent().build();
            return ResponseEntity.ok(Util.JsonResponder("Status", "Success: Assigned order to the user."));

        } catch (RuntimeException re) {
            return ResponseEntity.ok(Util.JsonResponder("Status", re.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.ok(Util.JsonResponder("Status", "Failed to assign order: " + e.getMessage()));
        }
    }

    //@PatchMapping
    @GetMapping("/drop-order/{splitId}")
    public ResponseEntity<?> DropOrder(@PathVariable long splitId) {
        try {
            orderService.DropOrder(splitId);
            return ResponseEntity.ok(Util.JsonResponder("Status", "Success: Unassigned order from the user."));
        } catch (Exception e) {
            return ResponseEntity.ok(Util.JsonResponder("Status", "Failed to drop order: " + e.getMessage()));
        }
    }

    //@PatchMapping
    @GetMapping("/complete-order/{splitId}")
    public ResponseEntity<?> CompleteOrder(@PathVariable long splitId) {
        try {
            orderService.CompleteOrder(splitId);
            return ResponseEntity.ok(Util.JsonResponder("Status", "Success: Order is marked as complete."));
        } catch (Exception e) {
            return ResponseEntity.ok(Util.JsonResponder("Status", "Failed to complete order: " + e.getMessage()));
        }
    }


}
