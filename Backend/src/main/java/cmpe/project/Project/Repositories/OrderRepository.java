package cmpe.project.Project.Repositories;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import cmpe.project.Project.DTOs.CustomerOrderDTO;
import cmpe.project.Project.DTOs.DeliveryOrderDTO;
import cmpe.project.Project.DTOs.SplitOrderDTO;
import cmpe.project.Project.DatabaseHandler.DatabaseHandler;
import org.springframework.stereotype.Repository;


@Repository
public class OrderRepository {

    public void OrderDrop(long splitId, long driverId) throws SQLException {
        String query = 
        "UPDATE order_splits " +
        "SET status = 'unassigned', driver_id = null" +
        "WHERE split_id = ? AND driver_id = ?";

        Object[] params = { splitId, driverId };
        DatabaseHandler.INSTANCE.executeQuery(query, params);
    }

    public void UpdateBySplitId(long splitId, String columns, Object... columnData) throws SQLException {
        String query =
        "UPDATE order_splits " +
        "SET " + columns +
        "WHERE split_id = ?";

        List<Object> params = new ArrayList<>();
        if(columnData.length > 0) {
            for(Object cd : columnData)
                params.add(cd);
        }
        params.add(splitId);

        DatabaseHandler.INSTANCE.executeQuery(query, params.toArray());
    }

    public List<DeliveryOrderDTO> GetListByFilter(String filter, Object... filterParams) throws SQLException {
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
        "WHERE " + filter +
        "GROUP BY o.order_id, os.split_id, s.store_id " +
        "ORDER BY o.order_id, os.split_id, s.store_id";
        
        ResultSet rs;
        if(filterParams != null && filterParams.length > 0) {
            List<Object> params = new ArrayList<>();
            for(Object fp : filterParams)
                params.add(fp);

            rs = DatabaseHandler.INSTANCE.sendRequest(query, params.toArray());
        } 
        else
            rs = DatabaseHandler.INSTANCE.sendRequest(query, null);

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

    public long insertOrder(CustomerOrderDTO order) throws SQLException {
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
    
    public long insertOrderSplit(long orderId, SplitOrderDTO split) throws SQLException {
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
    
    public void insertOrderItems(long splitId, SplitOrderDTO split) throws SQLException {
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
