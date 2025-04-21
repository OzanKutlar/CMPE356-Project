package cmpe.project.Project.Utility;

public class SavedQuery {

    public String query;
    public Object[] params;


    public SavedQuery(String query, Object... params){
        this.query = query;
        this.params = params;
    }


}
