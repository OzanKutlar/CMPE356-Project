package cmpe.project.Project;

import java.util.HashMap;
import java.util.Map;

public class Item {
    private String itemName;
    private double itemPrice;
    private String itemPhotoLink;

    // Constructor
    public Item(String itemName, double itemPrice, String itemPhotoLink) {
        this.itemName = itemName;
        this.itemPrice = itemPrice;
        this.itemPhotoLink = itemPhotoLink;
    }

    // Getters
    public String getItemName() {
        return itemName;
    }

    public double getItemPrice() {
        return itemPrice;
    }

    public String getItemPhotoLink() {
        return itemPhotoLink;
    }

    // Method to convert item to HashMap
    public Map<String, Object> toHashMap() {
        Map<String, Object> itemMap = new HashMap<>();
        itemMap.put("ItemName", itemName);
        itemMap.put("ItemPrice", itemPrice);
        itemMap.put("ItemPhotoLink", itemPhotoLink);
        return itemMap;
    }

    // Override toString() for easy debugging
    @Override
    public String toString() {
        return "Item{" +
                "itemName='" + itemName + '\'' +
                ", itemPrice=" + itemPrice +
                ", itemPhotoLink='" + itemPhotoLink + '\'' +
                '}';
    }
}
