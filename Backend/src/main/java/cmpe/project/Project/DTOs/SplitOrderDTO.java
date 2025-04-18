package cmpe.project.Project.DTOs;

import java.math.BigDecimal;
import java.util.ArrayList;

public class SplitOrderDTO {
    private long storeId;
    private ArrayList<Long> products;
    private ArrayList<BigDecimal> amounts;

    // Getter and Setter for storeName
    public long getStoreId() {
        return storeId;
    }

    public void setStoreId(long storeId) {
        this.storeId = storeId;
    }

    // Getter and Setter for products
    public ArrayList<Long> getProducts() {
        return products;
    }

    public void setProducts(ArrayList<Long> products) {
        this.products = products;
    }

    // Getter and Setter for amounts
    public ArrayList<BigDecimal> getAmounts() {
        return amounts;
    }

    public void setAmounts(ArrayList<BigDecimal> amounts) {
        this.amounts = amounts;
    }
}
