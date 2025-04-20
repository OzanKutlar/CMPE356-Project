package cmpe.project.Project.DTOs;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

public class SplitOrderDTO {
    private Long storeId;
    private List<Long> products = new ArrayList<>();
    private List<Integer> amounts = new ArrayList<>();
    private List<BigDecimal> costPerProduct = new ArrayList<>();

    public SplitOrderDTO(){}

    @JsonCreator
    public SplitOrderDTO(
            @JsonProperty(value = "storeId", required = false) Long storeId,
            @JsonProperty(value = "products", required = false) List<Long> products,
            @JsonProperty(value = "amounts", required = false) List<Integer> amounts,
            @JsonProperty(value = "costPerProduct", required = false) List<BigDecimal> costPerProduct) {
        this.storeId = storeId;
        this.products = products != null ? products : new ArrayList<>();
        this.amounts = amounts != null ? amounts : new ArrayList<>();
        this.costPerProduct = costPerProduct != null ? costPerProduct : new ArrayList<>();
    }

    public String selfValidate(){
        if(storeId == null)
            return "Invalid split: Missing store ID";
        
        if(products == null || amounts == null || products.isEmpty() || amounts.isEmpty())
            return "Invalid split: Missing products or amounts.";
        
        if (products.size() != amounts.size())
            return "Products and amounts lists must have the same size";

        return "";

    }

    public List<BigDecimal> getCostPerProduct() {
        return costPerProduct;
    }

    public void setCostPerProduct(List<BigDecimal> costPerProduct) {
        this.costPerProduct = costPerProduct;
    }

    // Getter and Setter for storeId
    public Long getStoreId() {
        return storeId;
    }

    public void setStoreId(Long storeId) {
        this.storeId = storeId;
    }

    // Getter and Setter for products
    public List<Long> getProducts() {
        return products;
    }

    public void setProducts(List<Long> products) {
        this.products = products;
    }

    // Getter and Setter for amounts
    public List<Integer> getAmounts() {
        return amounts;
    }

    public void setAmounts(List<Integer> amounts) {
        this.amounts = amounts;
    }
}
