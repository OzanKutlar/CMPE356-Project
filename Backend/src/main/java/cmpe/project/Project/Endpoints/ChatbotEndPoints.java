package cmpe.project.Project.Endpoints;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/chatbot")
public class ChatbotEndPoints {

    @PostMapping("/ask")
    public ResponseEntity<?> handleChat(@RequestBody Map<String, Object> body) {
        String userMessage = ((String) body.getOrDefault("message", "")).toLowerCase();
        String reply;

        if (userMessage.contains("types of meat") || userMessage.contains("what meats do you have")) {
            reply = "We offer a variety of meats including beef, pork, chicken, lamb, and specialty cuts like wagyu beef and organic chicken.";
        } else if (userMessage.contains("order") || userMessage.contains("when will my order arrive")) {
            reply = "You can track your order by going to the 'Order List' section on your account page. Delivery times depend on your location, but typically, we deliver within 1-2 days.";
        } else if (userMessage.contains("customize cuts") || userMessage.contains("custom butcher services")) {
            reply = "Yes, we offer custom cuts. You can request your preferred cuts while placing an order or contact us directly through the 'Contact Us' section for special requests.";
        } else if (userMessage.contains("pricing") || userMessage.contains("how much is")) {
            reply = "Our prices vary by product and weight. You can check the prices directly on our website, or if you're looking for something specific, feel free to ask!";
        } else if (userMessage.contains("delivery") || userMessage.contains("shipping")) {
            reply = "We offer delivery services to most regions. Check the 'Delivery Page' for more details, including fees and time estimates.";
        } else {
            reply = "I'm sorry, I didn't quite understand that. Could you please rephrase or check out our FAQ section for more help?";
        }

        return ResponseEntity.ok().body(Map.of(
                "msg", "success",
                "message", reply
        ));
    }
}
