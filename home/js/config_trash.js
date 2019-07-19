
// PICANET DisplayVariables
{  "metric": "48h Readmission",
                        "mark": "bar",
                        "x": "admonth",
                        "y": ["der_discharge", "der_readmit"],
                        "categories": ["sourcead", "careareaad", "unitdisdest", "primarydiagnosisgroup"], 
                        "quantities": [{"q":"der_readmit", "granT": "admonth", "granP":["unit","national"], "yaggregates": "sum" },
                                      {"q":"der_unplannedAdm", "granT": "admonth", "granP":["unit","national"], "yaggregates": "sum" }],
                        "xType": "t",
                        "yType": ["q", "q"],
                        "xspan": "year",    
                        "yspan": "unit", 
                        "ylabel": "No. Records",
                        "tspan": 3,
                        "yaggregates": ["count", "count"],
                        "ehr": "Admissions",
                        "granP": ["unit", "unit"], 
                        "granT": {"monthly-annual": ["der_readmit"]}, 
                        "combinations": ["adtype&der_readmit"]
                     },
                     {  "metric": "Bed Days and Extubation",
                        "mark": "bar",
                        "x": "admonth" ,
                        "y":["der_bedDays", "der_invVentDays"],
                        "xType": "t",
                        "yType": ["q", "q"], 
                        "xspan": "year",    
                        "yspan": "unit", 
                        "ylabel": "No. Days",
                        "tspan": 3,                        
                        "yaggregates": ["sum", "sum", "sum"],
                        "ehr": "Admissions", 
                        "granP": ["unit", "unit", "unit"], 
                        "categories": ["unplannedextubation"], 
                        "quantities": [{"q":"pim3_s", "granT": "admonth", "granP":["unit","national"], "yaggregates": "sum" },
                                        {"q":"der_bedDays", "granT": "admonth", "granP":["unit","national"], "yaggregates": "sum" }],                       
                        "granT": {"monthly-annual": ["der_bedDays"]}, 
                        "combinations": ["adtype&der_readmit"]
                     }, 
                     {  "metric": "Specialty Case Mix",
                        "mark": "bar",
                        "x": "addate",
                        "y": "eventidscr",
                        "xType": ["t", "n"],
                        "yType": "q",
                        "xspan": "year",    
                        "yspan": "unit", 
                        "ylabel": "Num. Records",  
                        "yfilters": {"eventidscr" : "*"},                       
                        "tspan": 3,                        
                        "yaggregates": ["count"],
                        "ehr": "Admissions", 
                        "granP": ["unit"], 
                        "categories": ["primarydiagnosisgroup","intubation", "surgicalprocedure"], 
                        "quantities": [
                                        {"q":"der_death", "granT": "admonth", "granP":["unit"], "yaggregates": "sum" },
                                        {"q":"eventidscr", "granT": "admonth", "granP":["unit"], "yaggregates": "count"}
                                       ], // from tasks with a single quantitative variable                                                                   
                        "granT": {"monthly-annual": ["der_death"]}, 
                        "combinations": ["adtype&der_readmit"]
                     },
                     
                     {  "metric": "dependency",                        
                        "mark": "bar", // should remove this 
                        "x": "admonth",
                        "y": ["der_depLevel0", "der_depLevelEC" ,"der_depLevel1", "der_depLevel2", "der_depLevel3", "der_depLevel4", "der_depLevel5", "der_depLevel6"], 
                        "yaggregates": ["count"], 
                        "xType": ["t", "n"],
                        "yType": "q",  
                        "xspan": "year",    
                        "yspan": "unit",  
                        "tspan": 3,                           
                        "granP": ["unit"], 
                        "ehr": "Admissions",                        
                        "categories": ["primarydiagnosisgroup","adtype", "sex", "ethnic"],      
                        "quantities": [ {"q":"der_depLevel2", "granT": "admonth", "granP":["unit"], "yaggregates": "sum" },
                                        {"q":"der_depLevel3", "granT": "admonth", "granP":["unit"], "yaggregates": "sum" },
                                        {"q":"pim3_s", "granT": "admonth", "granP":["unit","national"], "yaggregates": "sum" }
                                       ], // from tasks with a single quantitative variable                                                                   
                        "granT": {"monthly-annual": ["der_depLevel2", "der_depLevel3"]}   // the first element holds the master view's granT                                             
          
                     }, 
                      {
                      "metric": "Data Quality",
                      "mark": "bar", // should remove this 
                        "x": "admonth",
                        "y": ["der_missing", "der_invalid"], 
                        "yaggregates": ["sum", "sum"], 
                        "xType": "t",
                        "yType": ["q", "q"],  
                        "xspan": "year",    
                        "yspan": "unit", 
                        "ylabel": "No. Values",                         
                        "tspan": 3,                           
                        "granP": ["unit", "unit"], 
                        "ehr": "Admissions",
                        /** Slave Tasks spec begin here **/ 
                        "categories": ["primarydiagnosisgroup","adtype", "sex", "ethnic"],      
                        "quantities": [
                                        {"q":"der_death", "granT": "admonth", "granP":["unit"], "yaggregates": "sum" },
                                        {"q":"eventidscr", "granT": "admonth", "granP":["unit"], "yaggregates": "count" },
                                        {"q":"der_missing", "granT": "admonth", "granP":["unit"], "yaggregates": "sum" }
                                       ], // from tasks with a single quantitative variable                                                                   
                        "granT": {"monthly-annual": ["der_missing"]}   // the first element holds the master view's granT                                             
          
                     },
                     {  "metric": "Dependency",                        
                        "mark": "bar", 
                        "chart": "stacked",
                        "x": "addate",
                        "y": ["der_depLevel0", "der_depLevelEC" ,"der_depLevel1", "der_depLevel2", "der_depLevel3", "der_depLevel4", "der_depLevel5", "der_depLevel6"], 
                        "yaggregates": ["count"], 
                        "xType": ["t", "n"],
                        "yType": "q",  
                        "xspan": "year",    
                        "yspan": "unit",  
                        "tspan": 3,                           
                        "granP": ["unit"], 
                        "ehr": "Admissions",                        
                        "categories": ["primarydiagnosisgroup","adtype", "sex", "ethnic"],      
                        "quantities": [ {"q":"der_depLevel2", "granT": "admonth", "granP":["unit"], "yaggregates": "sum" },
                                        {"q":"der_depLevel3", "granT": "admonth", "granP":["unit"], "yaggregates": "sum" },
                                        {"q":"pim3_s", "granT": "admonth", "granP":["unit","national"], "yaggregates": "sum" }
                                       ], // from tasks with a single quantitative variable                                                                   
                        "granT": {"monthly-annual": ["der_depLevel2", "der_depLevel3"]}   // the first element holds the master view's granT                                             
          
                     },



/*,
                     {  "metric": "Capacity for Echo",    
                        "mark": "bar",
                        "x": "3.06 Date/time arrival at hospital",
                        "y": "der_reqEcho",
                        "xType": ["t", "n"],
                        "yType": "q",
                        "xspan": "year",    
                        "yspan": "unit", 
                        "ylabel": "No. Records",                        
                        "tspan": 3,                        
                        "yaggregates": ["count"],
                        "ehr": "Admissions", 
                        "granP": ["unit"], 
                        "categories": ["2.36 Site of infarction", "1.07 Patient gender"], 
                        "quantities": [
                                        {"q":"der_reqEcho", "granT": "admonth", "granP":["unit"], "yaggregates": "count" },
                                        {"q":"der_dtb", "granT": "admonth", "granP":["unit"], "yaggregates": "average"}
                                       ], // from tasks with a single quantitative variable                                                                   
                        "granT": {"monthly-annual": ["der_reqEcho"]} 
                        
                     }*/
                     
                                                 /*{  "metric": "48h Readmission",
                                                    "x": "3.06 Date/time arrival at hospital",
                                                    "y": "derived",
                                                    "xType": "t",
                                                    "yType": "q",
                                                    "aggregate": "count",
                                                    "scale": "monthly"
                                                 },
                                                 {  "metric": "Call-to-Balloon",
                                                    "x": "3.06 Date/time arrival at hospital" ,
                                                    "y":"Delay from Call for Help to Reperfusion Treatment",
                                                    "xType": "t",
                                                    "yType": "q", 
                                                    "aggregate": "count",
                                                    "scale": "monthly"
                                                 }, 
                                                 {  "metric": "Door-to-Balloon",
                                                    "x": "3.06 Date/time arrival at hospital",
                                                    "y": "Delay from Arrival in Hospital to Reperfusion Treatment",
                                                    "xType": "t",
                                                    "yType": "q",
                                                    "aggregate": "count",
                                                    "scale": "monthly"
                                                 },
                                                 {  "metric": "Length of Stay",
                                                    "x": "3.06 Date/time arrival at hospital",
                                                    "y": "derived",
                                                    "xType": "t",
                                                    "yType": "q",
                                                    "aggregate": "count",
                                                    "scale": "monthly"
                                                 },
                                                 {  "metric": "Complications",
                                                    "x": "3.06 Date/time arrival at hospital" ,
                                                    "y":"Bleeding complications",
                                                    "xType": "t",
                                                    "yType": "q", 
                                                    "aggregate": "count",
                                                    "scale": "monthly"
                                                }*/

                                                 {  
                        "metric": "48h Readmission",
                        "mark": "bar", // should remove this 
                        "x": "3.06 Date/time arrival at hospital",
                        "y": ["der_discharge", "der_readmit"], 
                        "yaggregates": ["count", "count"], 
                        "xType": "t",
                        "yType": ["q", "q"],  
                        "xspan": "year",    
                        "yspan": "unit",  
                        "ylabel": "No. Records",                        
                        "tspan": 3,                           
                        "granP": ["unit", "unit"], 
                        "ehr": "Admissions",
                        /** Slave Tasks spec begin here **/ 
                        "categories": ["2.01 Initial diagnosis","2.03 ECG determining treatment", "2.02 Method of admission", "1.07 Patient gender"],      
                        "quantities": [{"q":"der_discharge", "granT": "admonth", "granP":["unit"], "yaggregates": "count" },
                                        {"q":"der_readmit","granT": "admonth", "granP":["unit"], "yaggregates": "count" },                                         
                                        {"q":"2.29 Height", "granT": "admonth", "granP":["unit"], "yaggregates": "sum" }
                                       ], // from tasks with a single quantitative variable                                                                   
                        "granT": {"monthly-annual": ["der_readmit", "der_discharge"] }   // the first element holds the master view's granT                                             
          
                     },
                     {  
                        "metric": "Call-to-Balloon",
                        "mark": "bar", // should remove this 
                        "x": "3.06 Date/time arrival at hospital",
                        "y": [ "der_stemi", "der_ctbTarget"], 
                        "yaggregates": [ "count", "count"], 
                        "xType": "t",
                        "yType": [ "q", "q"],  
                        "xspan": "year",    
                        "yspan": "unit",  
                        "ylabel": "No. Records",                        
                        "tspan": 3,                           
                        "granP": [ "unit", "unit"], 
                        "ehr": "Admissions",
                        /** Slave Tasks spec begin here **/ 
                        "categories": ["2.02 Method of admission", "Patient District Number"],      
                        "quantities": [
                                        {"q":"der_stemi","granT": "admonth", "granP":["unit"], "yaggregates": "count" },                                         
                                        {"q":"der_ctbTargetMet", "granT": "admonth", "granP":["unit"], "yaggregates": "percent"}, 
                                         {"q":"der_dtb", "granT": "admonth", "granP":["unit"], "yaggregates": "average"}
                                       ],                                                               
                        "granT": {"monthly-annual": [ "der_stemi", "der_ctbTarget"] }             
                     },
                     {  
                        "metric": "Door-to-Angio",
                        "mark": "bar", // should remove this 
                        "x": "3.06 Date/time arrival at hospital",
                        "y": [ "der_nstemi", "der_angioTarget"], 
                        "yaggregates": [ "count", "count"], 
                        "xType": "t",
                        "yType": [ "q", "q"],  
                        "xspan": "year",    
                        "yspan": "unit",  
                        "ylabel": "No. Records",                        
                        "tspan": 3,                           
                        "granP": [ "unit", "unit"], 
                        "ehr": "Admissions",
                        /** Slave Tasks spec begin here **/ 
                        "categories": ["2.02 Method of admission", "1.07 Patient gender", "Patient District Number", "3.10 Delay before treatment"],      
                        "quantities": [
                                        {"q":"der_nstemi","granT": "admonth", "granP":["unit"], "yaggregates": "count" },                                         
                                        {"q":"der_ctbTarget", "granT": "admonth", "granP":["unit"], "yaggregates": "count"}, 
                                         {"q":"der_ctb", "granT": "admonth", "granP":["unit"], "yaggregates": "average"}, 
                                         {"q":"der_dtb", "granT": "admonth", "granP":["unit"], "yaggregates": "average"}
                                       ], // from tasks with a single quantitative variable                                                                   
                        "granT": {"monthly-annual": [ "der_nstemi", "der_ctbTarget"] }   // the first element holds the master view's granT                                             
          
                                              }