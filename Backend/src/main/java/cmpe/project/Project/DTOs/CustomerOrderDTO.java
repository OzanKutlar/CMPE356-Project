package cmpe.project.Project.DTOs;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

public class CustomerOrderDTO {
    private Long customerId;
    private String phoneNum;
    private String address;
    private List<SplitOrderDTO> splits = new ArrayList<SplitOrderDTO>();
    private String paymentMethod;
    private List<BigDecimal> splitCosts = new ArrayList<>();
    private BigDecimal totalCost;
    private String transactionId;
    //private CreditCardDTO cardCredentials;
    
    public CustomerOrderDTO(){}

    @JsonCreator
    public CustomerOrderDTO(
            @JsonProperty(value = "customerId", required = false) Long customerId,
            @JsonProperty(value = "phoneNum", required = false) String phoneNum,
            @JsonProperty(value = "address") String address,
            @JsonProperty(value = "splits") List<SplitOrderDTO> splits,
            @JsonProperty(value = "paymentMethod") String paymentMethod,
            @JsonProperty(value = "splitCosts", required = false) List<BigDecimal> splitCosts,
            @JsonProperty(value = "totalCost", required = false) BigDecimal totalCost,
            @JsonProperty(value = "transactionId", required = false) String transactionId) {
        this.customerId = customerId;
        this.phoneNum = phoneNum != null ? phoneNum : "";
        this.address = address;
        this.splits = splits; // != null ? splits : new ArrayList<>();
        this.paymentMethod = paymentMethod;
        this.splitCosts = splitCosts != null ? splitCosts : new ArrayList<>();
        this.totalCost = totalCost != null ? totalCost : BigDecimal.ZERO;
        this.transactionId = transactionId;
    }


    public boolean selfValidation(){
        if(address == null || splits == null || splits.isEmpty() || paymentMethod == null)
            return false;
        return true;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public List<BigDecimal> getSplitCosts() {
        return splitCosts;
    }

    public void setSplitCosts(List<BigDecimal> splitCosts) {
        this.splitCosts = splitCosts;
    }
    
    public BigDecimal getTotalCost() {
        return totalCost;
    }

    public void setTotalCost(BigDecimal totalCost) {
        this.totalCost = totalCost;
    }


    // Getter and Setter for customerId
    public long getCustomerId() {
        if(customerId == null){
            return -1;
        }
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    // Getter and Setter for address
    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    // Getter and Setter for splits
    public List<SplitOrderDTO> getSplits() {
        return splits;
    }

    public void setSplits(List<SplitOrderDTO> splits) {
        this.splits = splits;
    }

    // Getter and Setter for paymentMethod
    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    // Getter and Setter for cardCredentials
    // public CreditCardDTO getCardCredentials() {
    //     return cardCredentials;
    // }

    // public void setCardCredentials(CreditCardDTO cardCredentials) {
    //     this.cardCredentials = cardCredentials;
    // }

    public String getPhoneNum() {
        return phoneNum;
    }

    public void setPhoneNum(String phoneNum) {
        this.phoneNum = phoneNum;
    }

}
