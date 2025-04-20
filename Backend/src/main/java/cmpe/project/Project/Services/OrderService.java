package cmpe.project.Project.Services;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import cmpe.project.Project.DatabaseHandler.DatabaseHandler;
import cmpe.project.Project.Utility.Util;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import cmpe.project.Project.DTOs.CustomerOrderDTO;
import cmpe.project.Project.DTOs.DeliveryOrderDTO;
import cmpe.project.Project.DTOs.SplitOrderDTO;
import cmpe.project.Project.Repositories.OrderRepository;
import cmpe.project.Project.Utility.CustomExceptions.SplitErrorException;


@Service
public class OrderService {
    
    @Autowired
    private OrderRepository orderRepository;

    // @Autowired
    // private CreditCardService creditCardService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public void SubmitOrder(CustomerOrderDTO order, boolean isPaid) throws SQLException, SplitErrorException {
        List<SplitOrderDTO> splits = order.getSplits();
        List<BigDecimal> splitCosts = order.getSplitCosts();

        long orderId = orderRepository.insertOrder(order);
        String paymentMethod = order.getPaymentMethod();
        long paymentId = 0;

        if(isPaid) {
            paymentId = orderRepository.insertPayment(paymentMethod, order.getTransactionId(), order.getTotalCost(), "completed");
        }
        
        for (int i = 0; i<splits.size(); i++) {
            SplitOrderDTO split = splits.get(i);
            if(!isPaid)
                paymentId = orderRepository.insertPayment(paymentMethod, (String) null, splitCosts.get(i), "pending");
            long splitId = orderRepository.insertOrderSplit(orderId, split.getStoreId(), paymentId);
            orderRepository.insertOrderItems(splitId, split);
        }

        Object[] arr = orderRepository.GetListByFilter("o.order_id = ? ", orderId).toArray();
        messagingTemplate.convertAndSend("/topic/unassigned-add", arr);
    }

    public void CompleteOrder (long splitId) throws SQLException {
        orderRepository.UpdateSplitStatusBySplitId(splitId, "completed");
        try{
            Util.sendSMS(getPhoneFromSplitID(String.valueOf(splitId)), "Dear customer, your order has been delivered.");
        }
        catch(Exception e){
        }
    }

    public void CancelOrder (long orderID) throws SQLException {
        orderRepository.UpdateSplitStatusByOrderID(orderID, "canceled");
    }

    public void RefundOrder (long orderID) throws SQLException {
        orderRepository.UpdateSplitStatusByOrderID(orderID, "refunded");
    }

    public void CancelSplit(long splitId) throws SQLException {
        orderRepository.UpdateSplitStatusBySplitId(splitId, "canceled");
        
        String message = "Order #" + splitId + " canceled successfully";
        Map<String, Object> payload = new HashMap<>();
        payload.put("splitId", splitId);
        payload.put("message", message);

        messagingTemplate.convertAndSend("/topic/order-canceled", payload);
    }

    public void AssignOrder(long splitId, long driverId) throws SQLException, RuntimeException {
        //Update driver_id and status
        orderRepository.UpdateAssignment(splitId, driverId, "unassigned", "assigned");

        String message = "Order #" + splitId + " has been assigned to driver: " + driverId;
        try{
            Util.sendSMS(getPhoneFromSplitID(String.valueOf(splitId)), "Dear customer, your order has been picked up by our drivers.");
        }
        catch(Exception e){
        }
        Map<String, Object> payload = new HashMap<>();
        payload.put("splitId", splitId);
        payload.put("driverId", driverId);
        payload.put("message", message);

        messagingTemplate.convertAndSend("/topic/order-assigned", payload);
    }

    public String getPhoneFromSplitID(String splitID){
        String query = """
                SELECT
                    os.split_id,
                    CASE
                        WHEN o.customer_id IS NULL THEN o.temp_phone_num
                        ELSE u.phone
                    END AS phone_number
                FROM order_splits os
                JOIN orders o ON os.order_id = o.order_id
                LEFT JOIN users u ON o.customer_id = u.id
                WHERE os.split_id = ?;
                """;
        Object[] params = {splitID};

        try (ResultSet rs = DatabaseHandler.INSTANCE.sendRequest(query, params)) {
            while (rs != null && rs.next()) {
                return rs.getString("phone_number");
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return "";
    }

    public void DropOrder(long splitId) throws SQLException {
        orderRepository.UpdateAssignment(splitId, null, "assigned", "unassigned");
        try{
            Util.sendSMS(getPhoneFromSplitID(String.valueOf(splitId)), "Dear customer, due to unforseen circumstances, your driver has dropped your order. Another driver will pick your order back up shortly.");
        }
        catch(Exception e){
        }
        DeliveryOrderDTO dto = orderRepository.GetListByFilter("os.split_id = ? ", splitId).get(0);

        Object[] arr = { dto };
        messagingTemplate.convertAndSend("/topic/unassigned-add", arr);
    }

    public List<DeliveryOrderDTO> GetUnassignedOrders() throws SQLException {
        List<DeliveryOrderDTO> list = orderRepository.GetListByFilter("os.status = ? ", "unassigned");
        System.out.println(list);
        return list;
    }

    public List<DeliveryOrderDTO> GetAssignedOrdersFilterByDriver(Long driverId) throws SQLException {
        List<DeliveryOrderDTO> list = orderRepository.GetListByFilter("os.status = ? AND os.driver_id = ? ", "assigned", driverId);
        System.out.println(list);
        return list;
    }

    public void calculateOrderCosts(CustomerOrderDTO order) throws SQLException, SplitErrorException {
        List<SplitOrderDTO> splits = order.getSplits();
        List<BigDecimal> splitCosts = new ArrayList<>();
        BigDecimal totalCost = BigDecimal.ZERO;

        for(SplitOrderDTO split : splits){
            String str = split.selfValidate();
            if(!str.equals(""))
                throw new SplitErrorException("Error: " + str);
            
            BigDecimal splitCost = orderRepository.CalculateSplitCost(split);
            splitCosts.add(splitCost);
            totalCost = totalCost.add(splitCost);
        }
        order.setSplitCosts(splitCosts);
        order.setTotalCost(totalCost);
    }
    

    

}

