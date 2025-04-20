package cmpe.project.Project.Repositories;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.StringJoiner;

import org.springframework.stereotype.Repository;

import cmpe.project.Project.DTOs.CustomerOrderDTO;
import cmpe.project.Project.DTOs.DeliveryOrderDTO;
import cmpe.project.Project.DTOs.SplitOrderDTO;
import cmpe.project.Project.DatabaseHandler.DatabaseHandler;
import cmpe.project.Project.Utility.CustomExceptions.SplitErrorException;
import cmpe.project.Project.Utility.CustomExceptions.UnmatchingLengthException;

@Repository
public class OrderRepository {

    public void UpdateSplitStatusBySplitId(long splitId, String status) throws SQLException {
        String query = "UPDATE order_splits SET status = ? WHERE split_id = ?";
        Object[] params = { status, splitId };
        int rowCount = DatabaseHandler.INSTANCE.executeQuery(query, params);
        if(rowCount < 1)
            throw new RuntimeException("No such order found. Try again later");
    }

    public void UpdateAssignment(long splitId, Long driverId, String currentStatus, String newStatus) throws SQLException, RuntimeException {
        //assign = update driver id and status according to split id and currentstatus
        //drop   = update driver id and status according to split id and currentstatus
        String query = "UPDATE order_splits SET driver_id = ?, status = ? WHERE split_id = ? AND status = ?";
        Object[] params = { driverId, newStatus, splitId, currentStatus };
        int rowCount = DatabaseHandler.INSTANCE.executeQuery(query, params);
        if(rowCount < 1)
            throw new RuntimeException("Error: Order with matching id and status not found. No such entry or lost racing condition!");
    }

    public List<DeliveryOrderDTO> GetListByFilter(String filter, Object... filterParams) throws SQLException {
        String query = """
            SELECT 
                o.order_id, 
                os.split_id, 
                o.address AS customer_address,
                pa.payment_method, 
                s.name AS store_name, 
                s.address AS store_address,
                GROUP_CONCAT(p.name) AS product_names,
                GROUP_CONCAT(oi.amount) AS product_amounts,
                SUM(oi.price) AS total_price
            FROM orders o
            JOIN order_splits os ON o.order_id = os.order_id
            JOIN stores s ON os.store_id = s.store_id
            JOIN order_items oi ON os.split_id = oi.split_id
            JOIN products p ON oi.product_id = p.product_id
            JOIN payments pa ON os.payment_id = pa.payment_id
            WHERE """ + " " + filter + " " + """  
            GROUP BY o.order_id, os.split_id, s.store_id
            ORDER BY o.order_id, os.split_id, s.store_id        
            """;

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
        String query = "INSERT INTO orders (customer_id, address) VALUES (?, ?)";
        long orderID = order.getCustomerId();
        Object[] params = {orderID == -1 ? null : orderID, order.getAddress()};
        
        // Execute the query and get the generated keys
        long lastId = DatabaseHandler.INSTANCE.executeQueryAndGetId(query, params);
        if(lastId > -1)
            return lastId;
        
        throw new SQLException("Failed to retrieve order ID");
    }
    
    public long insertPayment(String paymentMethod, String transactionId, BigDecimal cost, String status) throws SQLException {
        String query = "INSERT INTO payments (payment_method, amount, status, transaction_id) VALUES (?, ?, ?, ?)";
        Object[] params = { paymentMethod, cost, status, transactionId };

        long lastId = DatabaseHandler.INSTANCE.executeQueryAndGetId(query, params);
        if(lastId > -1)
            return lastId;
        
        throw new SQLException("Failed to retrieve payment ID");
    }

    public long insertOrderSplit(long orderId, long storeId, long paymentId) throws SQLException {
        String query = "INSERT INTO order_splits (order_id, store_id, payment_id) VALUES (?, ?, ?)";
        Object[] params = {orderId, storeId, paymentId};
        
        long lastId = DatabaseHandler.INSTANCE.executeQueryAndGetId(query, params);
        if(lastId > -1)
            return lastId;
        
        throw new SQLException("Failed to retrieve split ID");
    }
    
    public void insertOrderItems(long splitId, SplitOrderDTO split) throws SQLException {
        List<Long> products = split.getProducts();
        List<Integer> amounts = split.getAmounts();
        List<BigDecimal> costPerProduct = split.getCostPerProduct();

        // Ensure both lists have the same size
        if (products.size() != amounts.size()) {
            throw new UnmatchingLengthException(products.size(), amounts.size());
        }
        
        String insertQuery = "INSERT INTO order_items (split_id, product_id, amount, price) VALUES (?, ?, ?, ?)";
        String updateQuery = """
            UPDATE products 
            SET currentStock = currentStock - ?, 
                soldStock = soldStock + ? 
            WHERE product_id = ?
            """;

        for (int i = 0; i < products.size(); i++) {
            long product = products.get(i);
            int amount = amounts.get(i);

            Object[] insertParams = { splitId, product, amount, costPerProduct.get(i) };
            DatabaseHandler.INSTANCE.executeQuery(insertQuery, insertParams);
            
            Object[] updateParams = { amount, amount, product };
            DatabaseHandler.INSTANCE.executeQuery(updateQuery, updateParams);
        }
    }

    public BigDecimal CalculateSplitCost(SplitOrderDTO split) throws SQLException, SplitErrorException {
        List<Long> products = split.getProducts();
        List<Integer> amounts = split.getAmounts();

        List<Object> params = new ArrayList<>();
        StringBuilder sb = new StringBuilder();
        StringJoiner sj = new StringJoiner(",");
        
        for(Long p : products){
            sj.add("?");
            params.add(p);
        }

        for(Long p : products){
            params.add(p);
        }
        
        String str = sj.toString();
        sb.append("SELECT product_id, currentStock, price_per_kg FROM products WHERE product_id IN (");
        sb.append(str);
        sb.append(") ORDER BY FIELD(product_id,");
        sb.append(str);
        sb.append(")");

        ResultSet rs = DatabaseHandler.INSTANCE.sendRequest(sb.toString(), params.toArray());
        BigDecimal splitCost = BigDecimal.ZERO;
        BigDecimal kgDivisor = new BigDecimal(1000);
        List<BigDecimal> productCosts = new ArrayList<>();
        int i = 0;
        while (rs.next()) {
            Long product = products.get(i);
            Integer amount = amounts.get(i);
            
            if(product == null || amount == null)
                throw new SplitErrorException("Null value for product: " + product + " OR amount: " + amount);

            if(product != rs.getLong("product_id"))
                throw new SplitErrorException("Unrecognized product ID: " + product);

            int currentStock = rs.getInt("currentStock");
            if(amount > currentStock)
                throw new SplitErrorException("Stock unavailable!");
            
            BigDecimal amountBD = new BigDecimal(amount);
            BigDecimal productCost = amountBD
                .divide(kgDivisor, 2, RoundingMode.HALF_UP)
                .multiply(rs.getBigDecimal("price_per_kg"));

            productCost.setScale(2, RoundingMode.HALF_UP);
            productCosts.add(productCost);
            splitCost = splitCost.add(productCost);

            i++;
        }
        split.setCostPerProduct(productCosts);
        return splitCost;
    }
    
}
