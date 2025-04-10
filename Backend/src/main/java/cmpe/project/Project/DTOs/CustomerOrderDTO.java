package cmpe.project.Project.DTOs;

import java.util.ArrayList;

public class CustomerOrderDTO {
    private long customerId;
    private String address;
    private ArrayList<SplitOrderDTO> splits;
    private String paymentMethod;
    private CreditCardDTO cardCredentials;
    
    // Getter and Setter for customerId
    public long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(long customerId) {
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
    public ArrayList<SplitOrderDTO> getSplits() {
        return splits;
    }

    public void setSplits(ArrayList<SplitOrderDTO> splits) {
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
    public CreditCardDTO getCardCredentials() {
        return cardCredentials;
    }

    public void setCardCredentials(CreditCardDTO cardCredentials) {
        this.cardCredentials = cardCredentials;
    }

}
