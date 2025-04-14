package cmpe.project.Project.Endpoints;

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


    @GetMapping("/get-assigned-orders")
    public ResponseEntity<?> GetAssignedOrders(@RequestHeader("userID") String user) {
        List<Map<String, Object>> assignedOrders = new ArrayList<>();

        String userId = UserEndpoints.sessionMap.get(Util.getUuidOrNull(user));

        String getAssignedOrdersQuery = "SELECT * FROM deliveries WHERE assignedTo = ? AND status = 'Pending'";

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


    @GetMapping("/assign-order")
    public ResponseEntity<?> AssignOrder(@RequestHeader("userID") String user, @RequestHeader("delivery_id") String delivery_id) {

        String userId = UserEndpoints.sessionMap.get(Util.getUuidOrNull(user));

        String phoneNo = null;

        Map<String, String> order = null;

        String getAssignedOrdersQuery = "SELECT assignedTo, istemp, phone_no, content FROM deliveries WHERE delivery_id = ?";

        try (ResultSet rs = DatabaseHandler.INSTANCE.sendRequest(getAssignedOrdersQuery, new Object[] { delivery_id })) {
            if(rs != null && rs.next()) {
                Map<String, String> orderTemp = new HashMap<>();
                orderTemp.put("assignedTo", rs.getString("assignedTo"));
                orderTemp.put("content", rs.getString("content"));

                if(!Objects.equals(orderTemp.get("assignedTo"), "-1")){
                    return ResponseEntity.ok().body(Map.of(
                            "msg", "error",
                            "message", "This order was already assigned."
                    ));
                }

                if(rs.getBoolean("istemp")){
                    phoneNo = rs.getString("phone_no");
                    order = orderTemp;
                }

            }
            else{
                return ResponseEntity.ok().body(Map.of(
                        "msg", "error",
                        "message", "No such order exists."
                ));
            }
        } catch (SQLException e) {
            e.printStackTrace();
            return ResponseEntity.ok().body(Map.of("msg", "error", "message", "Failed to fetch assigned orders"));
        }

        String assignOrderQuery = "UPDATE deliveries SET assignedTo = ? WHERE delivery_id = ? AND assignedTo = -1";
        String updateOrderQuery = "UPDATE userOrders SET status = 'In Delivery' WHERE delivery_id = ?";

        try {
            DatabaseHandler.INSTANCE.executeQuery(assignOrderQuery, new Object[] { userId, delivery_id });
            DatabaseHandler.INSTANCE.executeQuery(updateOrderQuery, new Object[] {delivery_id});

            if(phoneNo != null)
                sendSMS(phoneNo, format("Your order of %s has been picked up by our delivery drivers.", order.get("content")));
            return ResponseEntity.ok().body(Map.of("msg", "success", "message", "Order assigned successfully"));
        } catch (SQLException e) {
            e.printStackTrace();
            return ResponseEntity.ok().body(Map.of("msg", "error", "message", "Order could not be assigned (possibly already assigned or not found)"));
        } catch (Exception e) {
            return ResponseEntity.ok().body(Map.of("msg", "error", "message", "Unable to send phone message for user."));
        }
    }


    @GetMapping("/drop-order")
    public ResponseEntity<?> DropOrder(@PathVariable String delivery_id) {
        String dropDeliveryQuery = "UPDATE deliveries SET assignedTo = -1 WHERE delivery_id = ? AND assignedTo != -1";
        String updateOrderQuery = "UPDATE userOrders SET status = 'Pending' WHERE delivery_id = ?";

        String phoneNo = null;

        Map<String, String> order = null;

        String getAssignedOrdersQuery = "SELECT assignedTo, istemp, phone_no, content FROM deliveries WHERE delivery_id = ?";

        try (ResultSet rs = DatabaseHandler.INSTANCE.sendRequest(getAssignedOrdersQuery, new Object[] { delivery_id })) {
            if(rs != null && rs.next()) {
                Map<String, String> orderTemp = new HashMap<>();
                orderTemp.put("assignedTo", rs.getString("assignedTo"));
                orderTemp.put("content", rs.getString("content"));

                if(Objects.equals(orderTemp.get("assignedTo"), "-1")){
                    return ResponseEntity.ok().body(Map.of(
                            "msg", "error",
                            "message", "This order is not assigned."
                    ));
                }

                if(rs.getBoolean("istemp")){
                    phoneNo = rs.getString("phone_no");
                    order = orderTemp;
                }

            }
            else{
                return ResponseEntity.ok().body(Map.of(
                        "msg", "error",
                        "message", "No such order exists."
                ));
            }
        } catch (SQLException e) {
            e.printStackTrace();
            return ResponseEntity.ok().body(Map.of("msg", "error", "message", "Failed to fetch assigned orders"));
        }

        try {
            DatabaseHandler.INSTANCE.connection.setAutoCommit(false);

            int deliveryResult = DatabaseHandler.INSTANCE.executeQuery(dropDeliveryQuery, new Object[]{delivery_id});

            int orderResult = DatabaseHandler.INSTANCE.executeQuery(updateOrderQuery, new Object[]{delivery_id});

            // Commit transaction
            DatabaseHandler.INSTANCE.connection.commit();
            DatabaseHandler.INSTANCE.connection.setAutoCommit(true);

            if (deliveryResult > 0 || orderResult > 0) {
                try{
                    if(phoneNo != null)
                        sendSMS(phoneNo, format("Your order of %s has been dropped up by our delivery drivers.", order.get("content")));
                }
                catch(Exception e){
                    e.printStackTrace();
                }

                return ResponseEntity.ok().body(Map.of(
                        "msg", "success",
                        "message", "Order dropped successfully",
                        "deliveryUpdated", deliveryResult > 0,
                        "orderUpdated", orderResult > 0
                ));
            } else {
                return ResponseEntity.ok().body(Map.of(
                        "msg", "error",
                        "message", "Order not found or already unassigned"
                ));
            }
        } catch (SQLException e) {
            try {
                if (DatabaseHandler.INSTANCE.connection != null) {
                    DatabaseHandler.INSTANCE.connection.rollback();
                    DatabaseHandler.INSTANCE.connection.setAutoCommit(true);
                }
            } catch (SQLException ex) {
                ex.printStackTrace();
            }

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "msg", "error",
                    "message", "Database error: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/complete-order")
    public ResponseEntity<?> CompleteOrder(@RequestHeader("delivery_id") String delivery_id) {
        String completeDeliveryQuery = "UPDATE deliveries SET status = 'completed' WHERE delivery_id = ? AND status != 'completed'";
        String updateOrderQuery = "UPDATE userOrders SET status = 'Completed' WHERE delivery_id = ?";


        String phoneNo = null;

        Map<String, String> order = null;

        String getAssignedOrdersQuery = "SELECT assignedTo, istemp, phone_no, content FROM deliveries WHERE delivery_id = ?";

        try (ResultSet rs = DatabaseHandler.INSTANCE.sendRequest(getAssignedOrdersQuery, new Object[] { delivery_id })) {
            if(rs != null && rs.next()) {
                Map<String, String> orderTemp = new HashMap<>();
                orderTemp.put("assignedTo", rs.getString("assignedTo"));
                orderTemp.put("content", rs.getString("content"));

                if(Objects.equals(orderTemp.get("assignedTo"), "-1")){
                    return ResponseEntity.ok().body(Map.of(
                            "msg", "error",
                            "message", "This order is not assigned."
                    ));
                }

                if(rs.getBoolean("istemp")){
                    phoneNo = rs.getString("phone_no");
                    order = orderTemp;
                }

            }
            else{
                return ResponseEntity.ok().body(Map.of(
                        "msg", "error",
                        "message", "No such order exists."
                ));
            }
        } catch (SQLException e) {
            e.printStackTrace();
            return ResponseEntity.ok().body(Map.of("msg", "error", "message", "Failed to fetch assigned orders"));
        }

        try {
            DatabaseHandler.INSTANCE.connection.setAutoCommit(false);

            int deliveryResult = DatabaseHandler.INSTANCE.executeQuery(completeDeliveryQuery, new Object[]{delivery_id});

            int orderResult = DatabaseHandler.INSTANCE.executeQuery(updateOrderQuery, new Object[]{delivery_id});

            DatabaseHandler.INSTANCE.connection.commit();
            DatabaseHandler.INSTANCE.connection.setAutoCommit(true);

            if (deliveryResult > 0 || orderResult > 0) {
                try{
                    if(phoneNo != null)
                        sendSMS(phoneNo, format("Your order of %s has been completed.", order.get("content")));
                }
                catch(Exception e){
                    e.printStackTrace();
                }
                return ResponseEntity.ok().body(Map.of(
                        "msg", "success",
                        "message", "Order marked as completed",
                        "deliveryUpdated", deliveryResult > 0,
                        "orderUpdated", orderResult > 0
                ));
            } else {
                return ResponseEntity.ok().body(Map.of(
                        "msg", "warning",
                        "message", "Order not found or already completed"
                ));
            }
        } catch (SQLException e) {
            // Rollback transaction on error
            try {
                if (DatabaseHandler.INSTANCE.connection != null) {
                    DatabaseHandler.INSTANCE.connection.rollback();
                    DatabaseHandler.INSTANCE.connection.setAutoCommit(true);
                }
            } catch (SQLException ex) {
                ex.printStackTrace();
            }

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "msg", "error",
                    "message", "Database error: " + e.getMessage()
            ));
        }
    }



}
