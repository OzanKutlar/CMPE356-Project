package cmpe.project.Project.Services;

import java.math.BigDecimal;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import cmpe.project.Project.DTOs.CustomerOrderDTO;
import cmpe.project.Project.DTOs.DeliveryOrderDTO;
import cmpe.project.Project.DTOs.SplitOrderDTO;
import cmpe.project.Project.Repositories.OrderRepository;


@Service
public class OrderService {
    
    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CreditCardService creditCardService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public void SubmitOrder(CustomerOrderDTO order) throws SQLException, RuntimeException {
        long orderId = orderRepository.insertOrder(order);
        String paymentMethod = order.getPaymentMethod();
        boolean isPending = true;
        long paymentId = 0;

        List<SplitOrderDTO> splits = order.getSplits();
        List<BigDecimal> splitCosts = new ArrayList<>();
        BigDecimal totalCost = orderRepository.CalculateTotalCost(splits, splitCosts);

        if(paymentMethod.equals("Credit Card")) {
            if(creditCardService.HandleTransaction(order.getCardCredentials(), totalCost))
                throw new RuntimeException("Transaction failed, retry later");
            paymentId = orderRepository.insertPayment(paymentMethod, totalCost, "completed");
            isPending = false;
        }

        for (int i = 0; i<splits.size(); i++) {
            SplitOrderDTO split = splits.get(i);
            if(isPending)
                paymentId = orderRepository.insertPayment(paymentMethod, splitCosts.get(i), "pending");
            long splitId = orderRepository.insertOrderSplit(orderId, split.getStoreName(), paymentId);
            orderRepository.insertOrderItems(splitId, split);
        }
        Object[] arr = orderRepository.GetListByFilter("o.order_id = (SELECT MAX(order_id) FROM orders) ", (Object[]) null).toArray();
        messagingTemplate.convertAndSend("/topic/unassigned-add", arr);
    }

    public void CompleteOrder (long splitId) throws SQLException {
        orderRepository.UpdateBySplitId(splitId, null, "status = ? ", "completed");
    }

    public void CancelOrder (long splitId) throws SQLException {
        orderRepository.UpdateBySplitId(splitId, null, "status = ? ", "canceled");
        
        String message = "Order #" + splitId + " canceled successfully";
        Map<String, Object> payload = new HashMap<>();
        payload.put("splitId", splitId);
        payload.put("message", message);

        messagingTemplate.convertAndSend("/topic/order-canceled", payload);
    }

    public void AssignOrder(long splitId, long driverId) throws SQLException {
        orderRepository.UpdateBySplitId(splitId, "driver_id = ?, status = ?", "status = ?", driverId, "assigned", "unassigned");

        String message = "Order #" + splitId + " has been assigned to driver: " + driverId;
        Map<String, Object> payload = new HashMap<>();
        payload.put("splitId", splitId);
        payload.put("driverId", driverId);
        payload.put("message", message);

        messagingTemplate.convertAndSend("/topic/order-assigned", payload);
    }

    public void DropOrder(long splitId) throws SQLException {
        orderRepository.UpdateBySplitId(splitId, "driver_id = ?, status = ?", "status = ?", (Long) null, "assigned", "unassigned");
        DeliveryOrderDTO dto = orderRepository.GetListByFilter("os.splitId = ? ", splitId).get(0);

        Object[] arr = { dto };
        messagingTemplate.convertAndSend("/topic/unassigned-add", arr);
    }

    public List<DeliveryOrderDTO> GetUnassignedOrders() throws SQLException {
        return orderRepository.GetListByFilter("os.status = ? ", "unassigned");
    }

    public List<DeliveryOrderDTO> GetAssignedOrdersFilterByDriver(Long driverId) throws SQLException {
        return orderRepository.GetListByFilter("os.status = ? AND os.driver_id = ? ", "assigned", driverId);
        
    }

    

    

}

