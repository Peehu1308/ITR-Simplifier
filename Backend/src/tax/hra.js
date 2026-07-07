export function calculateHRAExemption(input,regime){
    if(regime==="new"){
        return 0;
    }

    const {salary={},hraDetails={}}=input;
    const {basic=0,dearnessAllowance=0}=salary;
    const {hraReceived=0,rentPaid=0,isMetro=false}=hraDetails;

    const basicPlusDA=basic+dearnessAllowance;
    if(hraReceived<=0 || rentPaid<=0){
        return 0;
    }

    const rentMinusTenPctSalary = Math.max(0, rentPaid - 0.1 * basicPlusDA);
    const metroLimit = (isMetro ? 0.5 : 0.4) * basicPlusDA;
 
    const exemption = Math.min(hraReceived, rentMinusTenPctSalary, metroLimit);
 
    return Math.max(0, exemption);
}