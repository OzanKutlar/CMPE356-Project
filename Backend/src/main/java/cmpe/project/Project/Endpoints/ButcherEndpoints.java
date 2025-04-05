package cmpe.project.Project.Endpoints;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static cmpe.project.Project.Utility.Util.logHeaders;

@RestController
@RequestMapping("/api/butcher")
public class ButcherEndpoints {


    /**
     * @param headers headers.get("userID") is a userID
     *                headers.get("items") is a list of items with the following structure :
     *                [
     *                {
     *                "name": "Antrikot",
     *                "photoLink": "/src/assets/antrikot.png",
     *                "pricePerKg": "13",
     *                "stock": "20"
     *                }
     *                ]
     *                <p>
     *                returns msg : success if it went ok. Returns the error message in msg if not.
     * @return
     */
    @GetMapping("/saveButcher")
    public ResponseEntity<?> saveButcher(@RequestHeader Map<String, String> headers) {
        logHeaders("saveButcher", headers);
        return ResponseEntity.ok().body(Map.of("msg", "success"));
    }

    /**
     * @param headers
     * header.userID (See above for explanation)
     *
     * should return the items that have generated the most profit to the seller based on their userID.
     * @return
     */
    @GetMapping("/getMostProfits")
     public ResponseEntity<?> getMostProfits(@RequestHeader Map<String, String> headers) {
        logHeaders("getMostProfits", headers);
        return ResponseEntity.ok().body(new ArrayList<>()); // Stub: Replace with actual logic
    }

    /**
     * The below three functions are practically identical, only returning a success or failure like saveButcher.
     *
     * @param headers
     * header.userID (See above for explanation)
     *
     * should return the items that have generated the most profit to the seller based on their userID.
     * @return
     */
    @GetMapping("/refundTransaction")
    public ResponseEntity<?> refundTransaction(@RequestHeader Map<String, String> headers) {
        logHeaders("refundTransaction", headers);
        return ResponseEntity.ok().body(Map.of("msg", "success"));
    }

    @GetMapping("/banUser")
    public ResponseEntity<?> banUser(@RequestHeader Map<String, String> headers) {
        logHeaders("banUser", headers);
        return ResponseEntity.ok().body(Map.of("msg", "success"));
    }
    @GetMapping("/banAddress")
    public ResponseEntity<?> banAddress(@RequestHeader Map<String, String> headers) {
        logHeaders("banAddress", headers);
        return ResponseEntity.ok().body(Map.of("msg", "success"));
    }

    /**
     * @param headers
     * header.userID (See above for explanation)
     * header.limit determines how many items should be returned. Start from the latest transaction.
     * header.pos determines which 'page' should be returned. If limit = 5 and pos = 0, the latest 5 transactions are returned, if limit = 5 and pos = 1
     *  the transactions from the 6th to the 10th are returned.
     * @return
     */
    @GetMapping("/getTransactions")
    public ResponseEntity<?> getTransactions(@RequestHeader Map<String, String> headers) {
        logHeaders("getTransactions", headers);
        return ResponseEntity.ok().body(new ArrayList<>()); // Stub: Replace with actual logic
    }

    @GetMapping("/getRecipes")
    public ResponseEntity<?> getRecipes(@RequestHeader Map<String, String> headers) {
        logHeaders("getRecipes", headers);
        return ResponseEntity.ok().body(new ArrayList<>()); // Placeholder
    }

    @GetMapping("/updateStock")
    public ResponseEntity<?> updateStock(@RequestHeader Map<String, String> headers) {
        logHeaders("updateStock", headers);
        return ResponseEntity.ok().body(Map.of("msg", "success"));
    }


    /**
     * headers has userid
     *
     * @param headers returns a list of how much of each item is left along with their initial stock count. in the following format :
     * [
     *   {
     *     ItemName: "Minced Meat",
     *     ItemPrice: 59.99,
     *     ItemPhotoLink: "https://static.ticimax.cloud/43437/uploads/urunresimleri/buyuk/kuzu-az-yagli-kiyma-1f-4f9.jpg",
     *     currentStock: 12,
     *     startStock: 30
     *   }
     * ]
     * @return
     */
    @GetMapping("/getStock")
   public ResponseEntity<?> getStock(@RequestHeader Map<String, String> headers) {
        logHeaders("getStock", headers);
        List<Map<String, Object>> stockData = new ArrayList<>();
        // Example mock data structure for testing
        stockData.add(Map.of(
            "ItemName", "Minced Meat",
            "ItemPrice", 59.99,
            "ItemPhotoLink", "https://static.ticimax.cloud/43437/uploads/urunresimleri/buyuk/kuzu-az-yagli-kiyma-1f-4f9.jpg",
            "currentStock", 12,
            "startStock", 30
        ));
        return ResponseEntity.ok().body(stockData);
    }
}

