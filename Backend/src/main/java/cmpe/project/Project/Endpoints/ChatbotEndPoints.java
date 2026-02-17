package cmpe.project.Project.Endpoints;

import cmpe.project.Project.DatabaseHandler.DatabaseHandler;
import cmpe.project.Project.Utility.Util;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static cmpe.project.Project.Utility.Logger.*;

@RestController
@RequestMapping("/api/chatbot")
public class ChatbotEndPoints {


    private static final ObjectMapper mapper = new ObjectMapper();
    //    private static final String modelURL = "http://localhost:5000/v1/chat/completions";
    private static final String modelURL = "http://100.104.199.33:8080/v1/chat/completions";

    public static String callLocalLLM(Map<String, String> messages) throws Exception {
        return callLocalLLM(messages, false);
    }

    public static String callLocalLLM(Map<String, String> messages, boolean giveThink) throws Exception {
        // Build the messages array
        ArrayNode messagesArray = mapper.createArrayNode();
        for (Map.Entry<String, String> entry : messages.entrySet()) {
            ObjectNode message = mapper.createObjectNode();
            message.put("role", entry.getKey());
            message.put("content", entry.getValue());
            messagesArray.add(message);
        }

        // Build the request body
        ObjectNode requestBody = mapper.createObjectNode();
        requestBody.put("model", "local-model");  // Replace with your actual model name if needed
        requestBody.set("messages", messagesArray);
        requestBody.put("max_tokens", 1000);

        // Send the HTTP request
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(modelURL))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody.toString()))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        // Parse and return the assistant's reply
        ObjectNode jsonResponse = (ObjectNode) mapper.readTree(response.body());
        String content = jsonResponse
                .withArray("choices")
                .get(0)
                .get("message")
                .get("content")
                .asText();
        if (giveThink) {
            return content.trim();
        }
        return content.trim().replaceAll("(?s)<think>.*?</think>", "").trim();
    }

    @PostMapping("/ask")
    public ResponseEntity<?> handleChat(@RequestBody Map<String, Object> body) {
        String userMessage = ((String) body.getOrDefault("message", "")).toLowerCase();
        String userIDText = ((String) body.getOrDefault("userID", ""));
        String userID = UserEndpoints.sessionMap.get(Util.getUuidOrNull(userIDText));
        ArrayList<Map<String, String>> history = (ArrayList<Map<String, String>>) body.getOrDefault("history", new ArrayList<>());

        // Convert history to string format for LLM
        StringBuilder userHistory = new StringBuilder();
        for (Map<String, String> message : history) {
            userHistory.append(message.get("role")).append(" : ").append(message.get("content")).append("\n");
        }

        try {
            // Determine action using local LLM
            String action = callLocalLLM(Map.of(
                    "system", "\"Act as a helpdesk agent with access to the user's database. Your role is to interpret user queries and execute commands related to order management. Follow these rules:   \n" +
                            "\n" +
                            "     \n" +
                            "\n" +
                            "    Command Parsing:   \n" +
                            "         If the user's message contains 'cancel' followed by an order number (e.g., 'Cancel order 123'), output: (cancel 123).  \n" +
                            "         If the user asks to 'see orders', output: (see orders) to retrieve all orders for the user.  \n" +
                            "         If the user requests 'info latest', output: (info latest) to fetch details of the most recent order.  \n" +
                            "         If the user wants information about a certain order, 'info x' (e.g., 'Show info for order 456'), output: (info 456).  \n" +
                            "         For regular text responses (not commands), output: (text)\n" +
                            "         Note that you should **only** give the outputted in paranthesis. No extra information. Just whether its an action like (cancel) or a (text) response. Another agent will respond with text if you do (text)",
                    "history", userHistory.toString(),
                    "user", userMessage));

            System.out.println("Predicted action: " + action);

            // Handle different actions based on LLM output
            if (!action.equals("(text)")) {
                // Check if user is logged in
                if (userID.isEmpty()) {
                    return ResponseEntity.ok().body(Map.of(
                            "msg", "usernotfound"
                    ));
                }

                String additionalInfo = "";

                if (action.equals("(see orders)")) {
                    // Retrieve all orders for the user
                    ArrayList<Map<String, String>> orders = getOrders(userID);
                    if (orders.isEmpty()) {
                        additionalInfo = "The user has no orders placed yet.";
                    } else {
                        additionalInfo = "Here are the user's orders:\n" + serializeOrdersToJson(orders);
                    }
                } else if (action.equals("(info latest)")) {
                    // Get latest order information
                    Map<String, String> latestOrder = getLatestOrder(userID);
                    if (latestOrder.isEmpty()) {
                        additionalInfo = "The user has no recent orders.";
                    } else {
                        additionalInfo = "User's latest order details:\n" + serializeOrderToJson(latestOrder);
                    }
                } else if (action.startsWith("(cancel ")) {
                    // Extract order ID from action string
                    Pattern pattern = Pattern.compile("\\(cancel (\\d+)\\)");
                    Matcher matcher = pattern.matcher(action);
                    if (matcher.find()) {
                        String orderID = matcher.group(1);
                        boolean cancelled = cancelOrder(orderID);
                        if (cancelled) {
                            additionalInfo = "Order #" + orderID + " has been successfully cancelled.";
                        } else {
                            additionalInfo = "Unable to cancel order #" + orderID + ". It might be already processed or delivered.";
                        }
                    }
                } else if (action.startsWith("(info ")) {
                    // Extract order ID from action string
                    Pattern pattern = Pattern.compile("\\(info (\\d+)\\)");
                    Matcher matcher = pattern.matcher(action);
                    if (matcher.find()) {
                        String orderID = matcher.group(1);
                        Map<String, String> orderInfo = getOrderInfo(orderID, userID);
                        if (orderInfo.isEmpty()) {
                            additionalInfo = "Order #" + orderID + " not found or doesn't belong to the user's account.";
                        } else {
                            additionalInfo = "Details for order #" + orderID + ":\n" + serializeOrderToJson(orderInfo);
                        }
                    }
                }

                return ResponseEntity.ok().body(Map.of(
                        "msg", "success",
                        "message", callLocalLLM(Map.of(
                                "system", "You are a helpdesk provider to a website called MeatGo, which is an online butcher store. " +
                                        "You have access to the customer's order information. " +
                                        "Formulate your response based on this order information when applicable. " +
                                        "Be helpful, friendly, and concise. Use a conversational tone rather than just stating facts. " +
                                        "If the user has cancelled an order, acknowledge that and offer other assistance. " +
                                        "For order listings, highlight key details like status, featured items, and total price. " +
                                        "For detailed order information, make sure to mention delivery status, payment info, and contents clearly.",
                                "additionalInfo", additionalInfo,
                                "history", userHistory.toString(),
                                "user", userMessage))
                ));
            }

            // For text responses or unhandled actions, use the general-purpose LLM
            return ResponseEntity.ok().body(Map.of(
                    "msg", "success",
                    "message", callLocalLLM(Map.of(
                            "system", "You are a helpdesk provider to a website called MeatGo, which is an online butcher store. Provide helpful, friendly, and concise assistance to customers. Use your knowledge of meat products, order processing, and customer service to address customer inquiries effectively.",
                            "history", userHistory.toString(),
                            "user", userMessage))
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.ok().body(Map.of(
                    "msg", "error",
                    "message", "Unable to process your request at this time. Please try again later."
            ));
        }
    }

    /**
     * Cancel an order if it's still in a cancellable state
     *
     * @param orderID The ID of the order to cancel
     * @return boolean indicating whether the cancellation was successful
     */
    private boolean cancelOrder(String orderID) {
        // First check the order's current status
        String checkStatusQuery = "SELECT status FROM order_splits WHERE order_id = ? LIMIT 1";

        try (ResultSet rs = DatabaseHandler.INSTANCE.sendRequest(checkStatusQuery, new Object[]{orderID})) {
            if (rs != null && rs.next()) {
                String status = rs.getString("status").toLowerCase();

                // Only allow cancellation for certain statuses
                if (status.equals("pending") || status.equals("processing") || status.equals("payment_received")) {
                    // Update the order status to cancelled
                    String updateQuery = "UPDATE order_splits SET status = 'cancelled' WHERE order_id = ?";
                    DatabaseHandler.INSTANCE.executeQuery(updateQuery, new Object[]{orderID});

                    // Log the cancellation
                    logAction("Order " + orderID + " cancelled by user request");
                    return true;
                } else {
                    // Order is in a state that can't be cancelled
                    return false;
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
            logError("Error cancelling order: " + orderID + ". Error: " + e.getMessage());
        }
        return false;
    }

    /**
     * Retrieve all orders for a specific user
     *
     * @param userID The ID of the user
     * @return ArrayList of order information maps
     */
    private ArrayList<Map<String, String>> getOrders(String userID) {
        String query = """
                SELECT
                    o.order_id,
                    o.customer_id,
                    o.address,
                    pa.payment_method,
                    pa.transaction_id,
                    os.status,
                    p_max.name AS most_expensive_product_name,
                    p_max.photo AS most_expensive_product_photo,
                    SUM(oi.price) AS total_price
                FROM orders o
                JOIN order_splits os ON o.order_id = os.order_id
                JOIN order_items oi ON os.split_id = oi.split_id
                JOIN products p ON oi.product_id = p.product_id
                JOIN payments pa ON os.payment_id = pa.payment_id

                -- subquery for most expensive item
                JOIN (
                    SELECT 
                        o2.order_id,
                        p2.name,
                        p2.photo
                    FROM order_splits os2
                    JOIN orders o2 ON os2.order_id = o2.order_id
                    JOIN order_items oi2 ON os2.split_id = oi2.split_id
                    JOIN products p2 ON oi2.product_id = p2.product_id
                    WHERE (o2.order_id, oi2.price) IN (
                        SELECT o3.order_id, MAX(oi3.price)
                        FROM order_splits os3
                        JOIN orders o3 ON os3.order_id = o3.order_id
                        JOIN order_items oi3 ON os3.split_id = oi3.split_id
                        GROUP BY o3.order_id
                    )
                ) AS p_max ON p_max.order_id = o.order_id

                WHERE o.customer_id = ?
                GROUP BY o.order_id
                ORDER BY o.order_id DESC
                LIMIT ?, ?
                """;

        int pos = 0;
        int limit = 10;
        Object[] queryParams = {userID, pos, limit};
        ArrayList<Map<String, String>> ordersList = new ArrayList<>();

        try (ResultSet rs = DatabaseHandler.INSTANCE.sendRequest(query, queryParams)) {
            while (rs != null && rs.next()) {
                Map<String, String> order = new HashMap<>();
                order.put("id", rs.getString("order_id"));
                order.put("address", rs.getString("address"));
                order.put("itemName", rs.getString("most_expensive_product_name"));
                order.put("itemPhoto", rs.getString("most_expensive_product_photo"));
                order.put("paymentMethod", rs.getString("payment_method"));
                order.put("paymentID", rs.getString("transaction_id"));
                order.put("status", capitalizeFirstLetter(rs.getString("status")));
                try {
                    order.put("totalPrice", rs.getString("total_price"));
                } catch (Exception e) {
                    order.put("totalPrice", "0.00");
                }
                ordersList.add(order);
            }
        } catch (SQLException e) {
            e.printStackTrace();
            logError("Error retrieving orders for user: " + userID + ". Error: " + e.getMessage());
        }

        return ordersList;
    }

    /**
     * Get the most recent order for a user
     *
     * @param userID The ID of the user
     * @return Map containing the latest order information
     */
    private Map<String, String> getLatestOrder(String userID) {
        String query = """
                SELECT
                    o.order_id,
                    o.customer_id,
                    o.address,
                    pa.payment_method,
                    pa.transaction_id,
                    os.status,
                    p_max.name AS most_expensive_product_name,
                    p_max.photo AS most_expensive_product_photo,
                    SUM(oi.price) AS total_price
                FROM orders o
                JOIN order_splits os ON o.order_id = os.order_id
                JOIN order_items oi ON os.split_id = oi.split_id
                JOIN products p ON oi.product_id = p.product_id
                JOIN payments pa ON os.payment_id = pa.payment_id

                -- subquery for most expensive item
                JOIN (
                    SELECT 
                        o2.order_id,
                        p2.name,
                        p2.photo
                    FROM order_splits os2
                    JOIN orders o2 ON os2.order_id = o2.order_id
                    JOIN order_items oi2 ON os2.split_id = oi2.split_id
                    JOIN products p2 ON oi2.product_id = p2.product_id
                    WHERE (o2.order_id, oi2.price) IN (
                        SELECT o3.order_id, MAX(oi3.price)
                        FROM order_splits os3
                        JOIN orders o3 ON os3.order_id = o3.order_id
                        JOIN order_items oi3 ON os3.split_id = oi3.split_id
                        GROUP BY o3.order_id
                    )
                ) AS p_max ON p_max.order_id = o.order_id

                WHERE o.customer_id = ?
                GROUP BY o.order_id
                ORDER BY o.order_id DESC
                LIMIT 1
                """;

        Object[] queryParams = {userID};
        Map<String, String> latestOrder = new HashMap<>();

        try (ResultSet rs = DatabaseHandler.INSTANCE.sendRequest(query, queryParams)) {
            if (rs != null && rs.next()) {
                latestOrder.put("id", rs.getString("order_id"));
                latestOrder.put("address", rs.getString("address"));
                latestOrder.put("itemName", rs.getString("most_expensive_product_name"));
                latestOrder.put("itemPhoto", rs.getString("most_expensive_product_photo"));
                latestOrder.put("paymentMethod", rs.getString("payment_method"));
                latestOrder.put("paymentID", rs.getString("transaction_id"));
                latestOrder.put("status", capitalizeFirstLetter(rs.getString("status")));
                try {
                    latestOrder.put("totalPrice", rs.getString("total_price"));
                } catch (Exception e) {
                    latestOrder.put("totalPrice", "0.00");
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
            logError("Error retrieving latest order for user: " + userID + ". Error: " + e.getMessage());
        }

        return latestOrder;
    }

    /**
     * Get detailed information about a specific order
     *
     * @param orderID The ID of the order
     * @param userID  The ID of the user (for verification)
     * @return Map containing order details
     */
    private Map<String, String> getOrderInfo(String orderID, String userID) {
        String query = """
                SELECT
                    o.order_id,
                    o.customer_id,
                    o.address,
                    pa.payment_method,
                    pa.transaction_id,
                    os.status,
                    p_max.name AS most_expensive_product_name,
                    p_max.photo AS most_expensive_product_photo,
                    SUM(oi.price) AS total_price,
                    COUNT(DISTINCT oi.item_id) AS item_count
                FROM orders o
                JOIN order_splits os ON o.order_id = os.order_id
                JOIN order_items oi ON os.split_id = oi.split_id
                JOIN products p ON oi.product_id = p.product_id
                JOIN payments pa ON os.payment_id = pa.payment_id

                -- subquery for most expensive item
                JOIN (
                    SELECT 
                        o2.order_id,
                        p2.name,
                        p2.photo
                    FROM order_splits os2
                    JOIN orders o2 ON os2.order_id = o2.order_id
                    JOIN order_items oi2 ON os2.split_id = oi2.split_id
                    JOIN products p2 ON oi2.product_id = p2.product_id
                    WHERE (o2.order_id, oi2.price) IN (
                        SELECT o3.order_id, MAX(oi3.price)
                        FROM order_splits os3
                        JOIN orders o3 ON os3.order_id = o3.order_id
                        JOIN order_items oi3 ON os3.split_id = oi3.split_id
                        GROUP BY o3.order_id
                    )
                ) AS p_max ON p_max.order_id = o.order_id

                WHERE o.order_id = ? AND o.customer_id = ?
                GROUP BY o.order_id
                """;

        Object[] queryParams = {orderID, userID};
        Map<String, String> orderInfo = new HashMap<>();

        try (ResultSet rs = DatabaseHandler.INSTANCE.sendRequest(query, queryParams)) {
            if (rs != null && rs.next()) {
                orderInfo.put("id", rs.getString("order_id"));
                orderInfo.put("address", rs.getString("address"));
                orderInfo.put("itemName", rs.getString("most_expensive_product_name"));
                orderInfo.put("itemPhoto", rs.getString("most_expensive_product_photo"));
                orderInfo.put("paymentMethod", rs.getString("payment_method"));
                orderInfo.put("paymentID", rs.getString("transaction_id"));
                orderInfo.put("status", capitalizeFirstLetter(rs.getString("status")));
                orderInfo.put("itemCount", rs.getString("item_count"));
                try {
                    orderInfo.put("totalPrice", rs.getString("total_price"));
                } catch (Exception e) {
                    orderInfo.put("totalPrice", "0.00");
                }

                // Get additional items in this order
                String itemsQuery = """
                        SELECT 
                            p.name, 
                            p.photo, 
                            oi.price, 
                            oi.quantity
                        FROM order_splits os
                        JOIN order_items oi ON os.split_id = oi.split_id
                        JOIN products p ON oi.product_id = p.product_id
                        WHERE os.order_id = ?
                        LIMIT 10
                        """;

                StringBuilder itemsList = new StringBuilder();
                try (ResultSet itemsRs = DatabaseHandler.INSTANCE.sendRequest(itemsQuery, new Object[]{orderID})) {
                    while (itemsRs != null && itemsRs.next()) {
                        if (itemsList.length() > 0) {
                            itemsList.append(", ");
                        }
                        itemsList.append(itemsRs.getString("name"))
                                .append(" (")
                                .append(itemsRs.getString("quantity"))
                                .append(")");
                    }
                }
                orderInfo.put("items", itemsList.toString());
            }
        } catch (SQLException e) {
            e.printStackTrace();
            logError("Error retrieving order info: " + orderID + " for user: " + userID + ". Error: " + e.getMessage());
        }

        return orderInfo;
    }

    /**
     * Serialize a list of orders to JSON format for the LLM
     *
     * @param orders List of order maps to serialize
     * @return JSON string with order information
     */
    private String serializeOrdersToJson(ArrayList<Map<String, String>> orders) {
        StringBuilder jsonBuilder = new StringBuilder("[");

        for (int i = 0; i < orders.size(); i++) {
            Map<String, String> order = orders.get(i);
            if (i > 0) {
                jsonBuilder.append(",");
            }
            jsonBuilder.append("\n  {");
            jsonBuilder.append("\n    \"orderID\": \"").append(order.get("id")).append("\",");
            jsonBuilder.append("\n    \"status\": \"").append(order.get("status")).append("\",");
            jsonBuilder.append("\n    \"featuredItem\": \"").append(order.get("itemName")).append("\",");
            jsonBuilder.append("\n    \"totalPrice\": \"$").append(order.get("totalPrice")).append("\",");
            jsonBuilder.append("\n    \"paymentMethod\": \"").append(order.get("paymentMethod")).append("\",");
            jsonBuilder.append("\n    \"address\": \"").append(order.get("address")).append("\"");
            jsonBuilder.append("\n  }");
        }

        jsonBuilder.append("\n]");
        return jsonBuilder.toString();
    }

    /**
     * Serialize a single order to JSON format for the LLM
     *
     * @param order Order details map
     * @return JSON string with detailed order information
     */
    private String serializeOrderToJson(Map<String, String> order) {
        StringBuilder jsonBuilder = new StringBuilder("{");

        jsonBuilder.append("\n  \"orderID\": \"").append(order.get("id")).append("\",");


        jsonBuilder.append("\n  \"status\": \"").append(order.get("status")).append("\",");
        jsonBuilder.append("\n  \"totalPrice\": \"$").append(order.get("totalPrice")).append("\",");
        jsonBuilder.append("\n  \"address\": \"").append(order.get("address")).append("\",");
        jsonBuilder.append("\n  \"paymentMethod\": \"").append(order.get("paymentMethod")).append("\",");
        jsonBuilder.append("\n  \"paymentID\": \"").append(order.get("paymentID")).append("\",");

        if (order.containsKey("items")) {
            jsonBuilder.append("\n  \"items\": \"").append(order.get("items")).append("\",");
        }

        jsonBuilder.append("\n  \"featuredItem\": \"").append(order.get("itemName")).append("\",");
        jsonBuilder.append("\n  \"itemCount\": \"").append(order.getOrDefault("itemCount", "1")).append("\",");

        // Add cancellation information
        boolean canCancel = order.get("status").equalsIgnoreCase("Unassigned") ||
                order.get("status").equalsIgnoreCase("processing") ||
                order.get("status").equalsIgnoreCase("payment_received");
        jsonBuilder.append("\n  \"canCancel\": ").append(canCancel);

        jsonBuilder.append("\n}");
        return jsonBuilder.toString();
    }

    /**
     * Format a list of orders into a readable response (kept for backward compatibility)
     *
     * @param orders List of order maps to format
     * @return Formatted string with order information
     */
    private String formatOrdersResponse(ArrayList<Map<String, String>> orders) {
        StringBuilder response = new StringBuilder("Here are your recent orders:\n\n");

        for (Map<String, String> order : orders) {
            response.append("Order #").append(order.get("id"))
                    .append(" - ").append(order.get("status"))
                    .append("\nFeaturing: ").append(order.get("itemName"))
                    .append("\nTotal: $").append(order.get("totalPrice"))
                    .append("\n\n");
        }

        response.append("You can ask for more details about any order by saying 'info' followed by the order number.");
        return response.toString();
    }

    /**
     * Format order details into a readable response (kept for backward compatibility)
     *
     * @param order Order details map
     * @return Formatted string with detailed order information
     */
    private String formatOrderDetails(Map<String, String> order) {
        StringBuilder response = new StringBuilder();

        response.append("Order #").append(order.get("id")).append("\n\n");


        response.append("Status: ").append(order.get("status")).append("\n")
                .append("Total Amount: $").append(order.get("totalPrice")).append("\n")
                .append("Shipping Address: ").append(order.get("address")).append("\n")
                .append("Payment Method: ").append(order.get("paymentMethod")).append("\n");

        if (order.containsKey("items")) {
            response.append("Items: ").append(order.get("items")).append("\n");
        } else {
            response.append("Featured Item: ").append(order.get("itemName")).append("\n");
        }

        if (order.get("status").equalsIgnoreCase("pending") ||
                order.get("status").equalsIgnoreCase("processing") ||
                order.get("status").equalsIgnoreCase("payment_received")) {
            response.append("\nYou can cancel this order by saying 'cancel order ").append(order.get("id")).append("'");
        }

        return response.toString();
    }

    /**
     * Capitalize the first letter of a string
     *
     * @param input String to capitalize
     * @return Capitalized string
     */
    private String capitalizeFirstLetter(String input) {
        if (input == null || input.isEmpty()) {
            return input;
        }
        return input.substring(0, 1).toUpperCase() + input.substring(1).toLowerCase();
    }

    /**
     * Log an action for auditing purposes
     *
     * @param message Message to log
     */
    private void logAction(String message) {
        // Implement logging as needed
        System.out.println("[ACTION] " + message);
    }



}
