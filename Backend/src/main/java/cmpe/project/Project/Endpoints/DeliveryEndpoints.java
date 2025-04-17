package cmpe.project.Project.Endpoints;

import cmpe.project.Project.Utility.Util;
import java.util.UUID;
import cmpe.project.Project.DatabaseHandler.DatabaseHandler;
import cmpe.project.Project.Utility.Util;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import cmpe.project.Project.Services.OrderService;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.*;

import static cmpe.project.Project.Utility.Logger.format;
import static cmpe.project.Project.Utility.Util.sendSMS;

@RestController
@RequestMapping("/api/delivery")
public class DeliveryEndpoints {


    @GetMapping("/get-unassigned-orders")
    public ResponseEntity<?> GetUnassignedOrders() {
        try {
            return ResponseEntity.ok(orderService.GetUnassignedOrders());
        } catch (Exception e) {
            return ResponseEntity.ok(Util.JsonResponder("Status", "Failed to get unassigned orders: " + e.getMessage()));
        }

        return ResponseEntity.ok().body(unassignedOrders);
    }

    @GetMapping("/get-assigned-orders/{uuid}")
    public ResponseEntity<?> GetAssignedOrders(@PathVariable UUID uuid) {
        try {
            return ResponseEntity.ok(orderService.GetAssignedOrdersFilterByDriver(Long.parseLong(UserEndpoints.sessionMap.get(uuid))));
        } catch (Exception e) {
            return ResponseEntity.ok(Util.JsonResponder("Status", "Failed to get assigned orders: " + e.getMessage()));
        }

        return ResponseEntity.ok().body(assignedOrders);
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
