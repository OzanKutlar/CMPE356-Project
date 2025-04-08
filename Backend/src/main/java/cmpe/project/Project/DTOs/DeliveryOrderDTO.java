package cmpe.project.Project.DTOs;

import java.math.BigDecimal;

public class DeliveryOrderDTO {
    private long orderId;
    private long splitId;
    private String storeName;
    private String storeAddress;
    private String customerAddress;
    private String paymentMethod;
    private String[] productNames;
    private String[] productAmounts;
    private BigDecimal totalPrice;

    // Getter and Setter for orderId
    public long getOrderId() {
        return orderId;
    }

    public void setOrderId(long orderId) {
        this.orderId = orderId;
    }

    // Getter and Setter for splitId
    public long getSplitId() {
        return splitId;
    }

    public void setSplitId(long splitId) {
        this.splitId = splitId;
    }

    // Getter and Setter for storeName
    public String getStoreName() {
        return storeName;
    }

    public void setStoreName(String storeName) {
        this.storeName = storeName;
    }

    // Getter and Setter for storeAddress
    public String getStoreAddress() {
        return storeAddress;
    }

    public void setStoreAddress(String storeAddress) {
        this.storeAddress = storeAddress;
    }

    // Getter and Setter for customerAddress
    public String getCustomerAddress() {
        return customerAddress;
    }

    public void setCustomerAddress(String customerAddress) {
        this.customerAddress = customerAddress;
    }

    // Getter and Setter for paymentMethod
    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    // Getter and Setter for productNames
    public String[] getProductNames() {
        return productNames;
    }

    public void setProductNames (String[] productNames) {
        this.productNames = productNames;
    }

    // Getter and Setter for productAmounts
    public String[] getProductAmounts() {
        return productAmounts;
    }

    public void setProductAmounts (String[] productAmounts) {
        this.productAmounts = productAmounts;
    }

    // Getter and Setter for totalPrice
    public BigDecimal getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(BigDecimal totalPrice) {
        this.totalPrice = totalPrice;
    }
}
