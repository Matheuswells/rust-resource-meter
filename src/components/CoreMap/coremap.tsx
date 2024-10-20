// import React from "react";
//
// export function CoreMap() {
//
//     const getColor = (value: number) => {
//         if (value === 0) return '#282828';
//         if (value <= 25) return 'green';
//         if (value <= 50) return 'yellow';
//         if (value <= 75) return 'orange';
//         return 'red';
//     };
//
//     const coreDivSize = 50;
//
//     return (
//         <div>
//             <div id="cpu-usage" style={{
//                 display: 'inline-grid',
//                 gridTemplateColumns: 'repeat(4, 1fr)',
//                 gap: '1px',
//                 justifyContent: 'center',
//                 alignItems: 'center',
//                 padding: '5px',
//                 border: '2px solid #3d3d3d',
//                 borderRadius: '10px'
//             }}>
//                 {appState.cpu_data.cpu_percent.map((value, index) => (
//                     <div key={index} style={{
//                         width: coreDivSize + 'px',
//                         height: coreDivSize + 'px',
//                         backgroundColor: getColor(value),
//                         border: '1px solid #000000',
//                         borderRadius: '50%',
//                         transition: 'background-color 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
//                     }}></div>
//                 ))}
//             </div>
//         </div>
//     )
// }