import "./listOfGlasses.css";

const ListOfGlasses=()=>{

    return(
        <div className="listOfGlasses">
            {[1,2,3,4,5].map((_,index)=>(
                <div key={index} className="glass_one"/>
            ))}
        </div>
    )
}
export default ListOfGlasses;