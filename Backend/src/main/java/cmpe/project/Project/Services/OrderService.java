package cmpe.project.Project.Services;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import cmpe.project.Project.DTOs.CustomerOrderDTO;
import cmpe.project.Project.DTOs.DeliveryOrderDTO;
import cmpe.project.Project.DTOs.SplitOrderDTO;
import cmpe.project.Project.DatabaseHandler.DatabaseHandler;


@Service
public class OrderService {
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public void SubmitOrder(CustomerOrderDTO order) {
        try {
            long orderId = insertOrder(order);
    
            // Then insert each split and its items
            for (SplitOrderDTO split : order.getSplits()) {
                long splitId = insertOrderSplit(orderId, split);
                insertOrderItems(splitId, split);
            }
            
        } catch (Exception e) {
            // TODO: handle exception
        }
    }

    public void UpdateStatus(long splitId, String status) {
        String query =
        "UPDATE order_splits " +
        "SET status = ? " +
        "WHERE split_id = ?";

        Object[] params = { status, splitId };

        try {
            DatabaseHandler.INSTANCE.executeQuery(query, params);
        } catch (Exception e) {
            // TODO: handle exception
        }
    }

    public void AssignOrder(long splitId, Long driverId) {
        String query =
        "UPDATE order_splits " +
        "SET driver_id = ? " +
        "WHERE split_id = ?";

        Object[] params = { driverId, splitId };

        try {
            DatabaseHandler.INSTANCE.executeQuery(query, params);
        } catch (Exception e) {
            // TODO: handle exception
        }
    }

    public List<DeliveryOrderDTO> GetUnassignedOrders() {
        String query =
        "SELECT o.order_id, os.split_id, o.address AS customer_address, " +
        "o.payment_method, s.name AS store_name, s.address AS store_address, " +
        "GROUP_CONCAT(p.name) AS product_names " +
        "GROUP_CONCAT(oi.amount) AS product_amounts, " +
        "SUM(oi.price) AS total_price, " +
        "FROM orders o " +
        "JOIN order_splits os ON o.order_id = os.order_id " +
        "JOIN stores s ON os.store_id = s.store_id " +
        "JOIN order_items oi ON os.split_id = oi.split_id " +
        "JOIN products p ON oi.product_id = p.product_id " +
        "WHERE os.status = 'unassigned' " +
        "GROUP BY o.order_id, os.split_id, s.store_id " +
        "ORDER BY o.order_id, os.split_id, s.store_id";

        try (ResultSet rs = DatabaseHandler.INSTANCE.sendRequest(query,null)) {
            return GetDeliveryList(rs);

        } catch (Exception e) {
            // TODO: handle exception
            return null;
        }

    }

    public List<DeliveryOrderDTO> GetAssignedOrdersFilterByDriver(Long driverId) {
        String query = 
        "SELECT o.order_id, os.split_id, o.address AS customer_address, " +
        "o.payment_method, s.name AS store_name, s.address AS store_address, " +
        "GROUP_CONCAT(p.name) AS product_names " +
        "GROUP_CONCAT(oi.amount) AS product_amounts, " +
        "SUM(oi.price) AS total_price, " +
        "FROM orders o " +
        "JOIN order_splits os ON o.order_id = os.order_id " +
        "JOIN stores s ON os.store_id = s.store_id " +
        "JOIN order_items oi ON os.split_id = oi.split_id " +
        "JOIN products p ON oi.product_id = p.product_id " +
        "WHERE os.status = 'assigned' AND os.driver_id = ? " +
        "GROUP BY o.order_id, os.split_id, s.store_id " +
        "ORDER BY o.order_id, os.split_id, s.store_id";
        
        try (ResultSet rs = DatabaseHandler.INSTANCE.sendRequest(query,null)) {
            return GetDeliveryList(rs);

        } catch (Exception e) {
            // TODO: handle exception
            return null;
        }
        
    }

    public List<DeliveryOrderDTO> GetDeliveryList(ResultSet rs) throws SQLException{
        List<DeliveryOrderDTO> list = new ArrayList<>();
        while(rs.next()){
            DeliveryOrderDTO dto = new DeliveryOrderDTO();
            dto.setOrderId(rs.getLong("order_id"));
            dto.setSplitId(rs.getLong("split_id"));
            dto.setStoreName(rs.getString("store_name"));
            dto.setStoreAddress(rs.getString("store_address"));
            dto.setCustomerAddress(rs.getString("customer_address"));
            dto.setPaymentMethod(rs.getString("payment_method"));
            dto.setProductNames(rs.getString("product_names").split(","));
            dto.setProductAmounts(rs.getString("product_amounts").split(","));
            dto.setTotalPrice(rs.getBigDecimal("total_price"));
            list.add(dto);
        }
        return list;
    }

    private long insertOrder(CustomerOrderDTO order) throws SQLException {
        String query = "INSERT INTO orders (customer_id, address, payment_method) VALUES (?, ?, ?)";
        Object[] params = {order.getCustomerId(), order.getAddress(), order.getPaymentMethod()};
        
        // Execute the query and get the generated keys
        DatabaseHandler.INSTANCE.executeQuery(query, params);
        
        // Get the last inserted ID (order_id)
        ResultSet rs = DatabaseHandler.INSTANCE.sendRequest("SELECT LAST_INSERT_ID()", null);
        if (rs != null && rs.next()) {
            return rs.getLong(1);
        }
        throw new SQLException("Failed to retrieve order ID");
    }
    
    private long insertOrderSplit(long orderId, SplitOrderDTO split) throws SQLException {
        String query = "INSERT INTO order_splits (order_id, store_name) VALUES (?, ?)";
        Object[] params = {orderId, split.getStoreName()};
        
        DatabaseHandler.INSTANCE.executeQuery(query, params);
        
        // Get the last inserted ID (split_id)
        ResultSet rs = DatabaseHandler.INSTANCE.sendRequest("SELECT LAST_INSERT_ID()", null);
        if (rs != null && rs.next()) {
            return rs.getLong(1);
        }
        throw new SQLException("Failed to retrieve split ID");
    }
    
    private void insertOrderItems(long splitId, SplitOrderDTO split) throws SQLException {
        ArrayList<Long> products = split.getProducts();
        ArrayList<BigDecimal> amounts = split.getAmounts();
        
        // Ensure both lists have the same size
        if (products.size() != amounts.size()) {
            throw new IllegalArgumentException("Products and amounts lists must have the same size");
        }
        
        String sql = "INSERT INTO order_items (split_id, product_id, amount) VALUES (?, ?, ?)";
        
        for (int i = 0; i < products.size(); i++) {
            Object[] params = {splitId, products.get(i), amounts.get(i)};
            DatabaseHandler.INSTANCE.executeQuery(sql, params);
        }
    }

}

