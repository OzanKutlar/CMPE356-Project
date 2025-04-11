package cmpe.project.Project.Endpoints;

import cmpe.project.Project.DatabaseHandler.DatabaseHandler;
import cmpe.project.Project.Utility.Util;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import cmpe.project.Project.Services.OrderService;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/delivery")
public class DeliveryEndpoints {


    @GetMapping("/get-unassigned-orders")
    public ResponseEntity<?> GetUnassignedOrders() {
        List<Map<String, Object>> unassignedOrders = new ArrayList<>();

        String getUnassignedOrdersQuery = "SELECT d.*, s.address AS store_address FROM deliveries d JOIN stores s ON d.store_id = s.store_id WHERE d.assignedTo = -1";

        try (ResultSet rs = DatabaseHandler.INSTANCE.sendRequest(getUnassignedOrdersQuery, null)) {
            while (rs != null && rs.next()) {
                Map<String, Object> order = new HashMap<>();
                order.put("order_id", rs.getString("delivery_id"));
//                order.put("startLocation", rs.getString("store_address"));
                order.put("startLocation", "Cibali, Kadir Has Cd., 34083 Cibali / Fatih/Fatih/Istanbul");
                order.put("destination", rs.getString("address"));
                order.put("totalPrice", rs.getString("totalPrice"));
                order.put("content", rs.getString("content").split(","));
                order.put("status", rs.getString("status"));

                unassignedOrders.add(order);
            }
        } catch (SQLException e) {
            e.printStackTrace();
            return ResponseEntity.ok().body(Map.of("msg", "error", "message", "Failed to fetch unassigned orders"));
        }

        return ResponseEntity.ok().body(unassignedOrders);
    }


    @GetMapping("/get-assigned-orders/{user}")
    public ResponseEntity<?> GetAssignedOrders(@PathVariable String user) {
        List<Map<String, Object>> assignedOrders = new ArrayList<>();

        String userId = UserEndpoints.sessionMap.get(Util.getUuidOrNull(user));

        String getAssignedOrdersQuery = "SELECT * FROM deliveries WHERE assignedTo = ?";

        try (ResultSet rs = DatabaseHandler.INSTANCE.sendRequest(getAssignedOrdersQuery, new Object[] { userId })) {
            while (rs != null && rs.next()) {
                Map<String, Object> order = new HashMap<>();
                order.put("order_id", rs.getString("delivery_id"));
//                order.put("startLocation", rs.getString("store_address"));
                order.put("startLocation", "Cibali, Kadir Has Cd., 34083 Cibali / Fatih/Fatih/Istanbul");
                order.put("destination", rs.getString("address"));
                order.put("totalPrice", rs.getString("totalPrice"));
                order.put("content", rs.getString("content").split(","));
                order.put("status", rs.getString("status"));
                order.put("assignedTo", rs.getString("assignedTo"));

                assignedOrders.add(order);
            }
        } catch (SQLException e) {
            e.printStackTrace();
            return ResponseEntity.ok().body(Map.of("msg", "error", "message", "Failed to fetch assigned orders"));
        }

        return ResponseEntity.ok().body(assignedOrders);
    }


    @PatchMapping("/assign-order/{user}/{delivery_id}")
    public ResponseEntity<?> AssignOrder(@PathVariable String user, @PathVariable String delivery_id) {

        String userId = UserEndpoints.sessionMap.get(Util.getUuidOrNull(user));
        String assignOrderQuery = "UPDATE deliveries SET assignedTo = ? WHERE delivery_id = ? AND assignedTo = -1";

        try {
            DatabaseHandler.INSTANCE.executeQuery(assignOrderQuery, new Object[] { userId, delivery_id });
            return ResponseEntity.ok().body(Map.of("msg", "success", "message", "Order assigned successfully"));
        } catch (SQLException e) {
            return ResponseEntity.ok().body(Map.of("msg", "error", "message", "Order could not be assigned (possibly already assigned or not found)"));
        }
    }


    @PatchMapping("/drop-order/{delivery_id}")
    public ResponseEntity<?> DropOrder(@PathVariable String delivery_id) {
        String dropOrderQuery = "UPDATE deliveries SET assignedTo = -1 WHERE delivery_id = ? AND assignedTo != -1";

        try {
            DatabaseHandler.INSTANCE.executeQuery(dropOrderQuery, new Object[]{delivery_id});
            return ResponseEntity.ok().body(Map.of("msg", "success", "message", "Order dropped successfully"));
        } catch (SQLException e) {
            return ResponseEntity.ok().body(Map.of("msg", "error", "message", "Order not found or already unassigned"));
        }
    }

    @PatchMapping("/complete-order/{delivery_id}")
    public ResponseEntity<?> CompleteOrder(@PathVariable String delivery_id) {
        String completeOrderQuery = "UPDATE deliveries SET status = 'COMPLETED' WHERE delivery_id = ? AND status != 'COMPLETED'";

        try {
            DatabaseHandler.INSTANCE.executeQuery(completeOrderQuery, new Object[]{delivery_id});
            return ResponseEntity.ok().body(Map.of("msg", "success", "message", "Order marked as completed"));
        } catch (SQLException e) {
            return ResponseEntity.ok().body(Map.of("msg", "error", "message", "Order not found or already completed"));
        }
    }



}
