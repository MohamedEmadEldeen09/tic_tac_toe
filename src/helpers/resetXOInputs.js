
//for redux 
export const resetXOInputs = (groundWinningTemplates)=>{
    groundWinningTemplates = groundWinningTemplates.map((tempalte)=>{
       return tempalte.map((item)=>{
           return {
            name: item.name,
            inputType :''
           } 
        })
    })
    return groundWinningTemplates
}