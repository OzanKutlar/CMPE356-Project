package cmpe.project.Project.Services;

import java.math.BigDecimal;
import java.sql.ResultSet;
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
    private SimpMessagingTemplate messagingTemplate;

    public void SubmitOrder(CustomerOrderDTO order) throws SQLException {
        long orderId = orderRepository.insertOrder(order);

        for (SplitOrderDTO split : order.getSplits()) {
            long splitId = orderRepository.insertOrderSplit(orderId, split);
            orderRepository.insertOrderItems(splitId, split);
        }
        Object[] arr = orderRepository.GetListByFilter("o.order_id = (SELECT MAX(order_id) FROM orders) ", (Object[]) null).toArray();
        messagingTemplate.convertAndSend("/topic/unassigned-add", arr);
    }

    public void CompleteOrder (long splitId) throws SQLException {
        orderRepository.UpdateBySplitId(splitId, "status = ? ", "completed");
    }

    public void CancelOrder (long splitId) throws SQLException {
        orderRepository.UpdateBySplitId(splitId, "status = ? ", "canceled");
        
        String message = "Order #" + splitId + " canceled successfully";
        Map<String, Object> payload = new HashMap<>();
        payload.put("splitId", splitId);
        payload.put("message", message);

        messagingTemplate.convertAndSend("/topic/order-canceled", payload);
    }

    public void AssignOrder(long splitId, long driverId) throws SQLException {
        orderRepository.UpdateBySplitId(splitId, "driver_id = ? ", driverId);

        String message = "Order #" + splitId + " has been assigned to driver: " + driverId;
        Map<String, Object> payload = new HashMap<>();
        payload.put("splitId", splitId);
        payload.put("driverId", driverId);
        payload.put("message", message);

        messagingTemplate.convertAndSend("/topic/order-assigned", payload);
    }

    public void DropOrder(long splitId) throws SQLException {
        orderRepository.UpdateBySplitId(splitId, "driver_id = ? ", (Long) null);
        DeliveryOrderDTO dto = orderRepository.GetListByFilter("os.splitId = ? ", splitId).get(0);

        messagingTemplate.convertAndSend("/topic/unassigned-add", dto);
    }

    public List<DeliveryOrderDTO> GetUnassignedOrders() throws SQLException {
        return orderRepository.GetListByFilter("os.status = ? ", "unassigned");
    }

    public List<DeliveryOrderDTO> GetAssignedOrdersFilterByDriver(Long driverId) throws SQLException {
        return orderRepository.GetListByFilter("os.status = ? AND os.driver_id = ? ", "assigned", driverId);
        
    }

    

    

}

