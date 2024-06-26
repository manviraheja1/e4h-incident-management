import React, { useRef, useEffect, useState } from "react";
import SubMenu from "./SubMenu";
import { Loader, SearchIcon } from "@egovernments/digit-ui-react-components";
import {
  ArrowForward,
  ArrowVectorDown,
  ArrowDirection,
  HomeIcon,
  ComplaintIcon,
  BPAHomeIcon,
  PropertyHouse,
  CaseIcon,
  ReceiptIcon,
  PersonIcon,
  Phone,
  LogoutIcon,
  DocumentIconSolid,
  DropIcon,
  CollectionsBookmarIcons,
  FinanceChartIcon,
  CollectionIcon,
} from "@egovernments/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import NavItem from "./NavItem";
import LogoutDialog from "../../Dialog/LogoutDialog";
import _, { findIndex } from "lodash";
const IconsObject = {
  home: <HomeIcon />,
  announcement: <ComplaintIcon />,
  
  "business-center": <PersonIcon />,
  
};
const EmployeeSideBar = () => {
  const sidebarRef = useRef(null);
  const { isLoading, data } = Digit.Hooks.useAccessControl();
 // console.log("data", data)
  const [search, setSearch] = useState("");
  const { t } = useTranslation();
  const [showDialog, setShowDialog] = useState(false);
  const leftIcon = IconsObject.announcement;
  useEffect(() => {
    if (isLoading) {
      return <Loader />;
    }
    sidebarRef.current.style.cursor = "pointer";
    collapseNav();
  }, [isLoading]);
  const handleOnSubmit = () => {
    Digit.UserService.logout();
    setShowDialog(false);
  }

  const handleOnCancel = () => {
    setShowDialog(false);
  }
  const expandNav = () => {
    sidebarRef.current.style.width = "260px";
    sidebarRef.current.style.overflow = "auto";

    sidebarRef.current.querySelectorAll(".dropdown-link").forEach((element) => {
      element.style.display = "flex";
    });
  };
  const collapseNav = () => {
    sidebarRef.current.style.width = "55px";
    sidebarRef.current.style.overflow = "hidden";

    sidebarRef.current.querySelectorAll(".dropdown-link").forEach((element) => {
      element.style.display = "none";
    });
    sidebarRef.current.querySelectorAll(".actions").forEach((element) => {
      element.style.padding = "0";
    });
  };

  const configEmployeeSideBar = {};

  //creating the object structure from mdms value for easy iteration
let configEmployeeSideBar1 = {};
  data?.actions?.filter((e) => e.url === "url" )?.forEach((item) => {
    _.set(configEmployeeSideBar1,item.path,{...item}) 
  })

  data?.actions
    .filter((e) => e.url === "url")
    .forEach((item) => {
      let index = item.path.split(".")[0];
     // console.log("index", index)
      if (search == "" && item.path !== "") {
         index = item.path.split(".")[0];
        if (index === "TradeLicense") index = "Trade License";
        if (!configEmployeeSideBar[index]) {
          configEmployeeSideBar[index] = [item];
        } else {
          configEmployeeSideBar[index].push(item);
        }
      } else if (item.path !== "" && t(`ACTION_TEST_${index?.toUpperCase()?.replace(/[ -]/g, "_")}`)?.toLowerCase().includes(search.toLowerCase())) {
         index = item.path.split(".")[0];
        if (index === "TradeLicense") index = "Trade License";
        if (!configEmployeeSideBar[index]) {
          configEmployeeSideBar[index] = [item];
        } else {
          configEmployeeSideBar[index].push(item);
        }
      }
    });
  let res = [];

  //method is used for restructing of configEmployeeSideBar1 nested object into nested array object
  function restructuringOfConfig (tempconfig){
    const result = [];
    for(const key in tempconfig){
      const value= tempconfig[key];
      if(typeof value === "object" && !(value?.id)){
      const children = restructuringOfConfig(value);
      result.push({label : key,children, icon:children?.[0]?.icon, to:""});
      }
      else{
        result.push({label: key, value, icon:value?.leftIcon, to: key === "Home" ? "/digit-ui/employee" : value?.navigationURL});
      }
    }

    return result
  }

   const handleLogout =()=>{
   console.log("heeee")
     setShowDialog(true)
      //return <LogoutDialog onSelect={handleOnSubmit} onCancel={handleOnCancel} onDismiss={handleOnCancel}></LogoutDialog>
    
  }
  const splitKeyValue = () => {
    const keys = Object.keys(configEmployeeSideBar);
    keys.sort((a, b) => a.orderNumber - b.orderNumber);
    for (let i = 0; i < keys.length; i++) {
      if (configEmployeeSideBar[keys[i]][0].path.indexOf(".") === -1) {
        if (configEmployeeSideBar[keys[i]][0].displayName === "Home") {
          const homeURL = "/digit-ui/employee";
          res.unshift({
            moduleName: keys[i].toUpperCase(),
            icon: configEmployeeSideBar[keys[i]][0],
            navigationURL: homeURL,
            type: "single",
          });
        } else {
          res.push({
            moduleName: configEmployeeSideBar[keys[i]][0]?.displayName.toUpperCase(),
            type: "single",
            icon: configEmployeeSideBar[keys[i]][0],
            navigationURL: configEmployeeSideBar[keys[i]][0].navigationURL,
          });
        }
      } else {
        res.push({
          moduleName: keys[i].toUpperCase(),
          links: configEmployeeSideBar[keys[i]],
          icon: configEmployeeSideBar[keys[i]][0],
          orderNumber: configEmployeeSideBar[keys[i]][0].orderNumber,
        });
      }
    }
    if(res.find(a => a.moduleName === "HOME"))
    {
      //res.splice(0,1);
      const indx = res.findIndex(a => a.moduleName === "HOME");
      const home = res?.filter((ob) => ob?.moduleName === "HOME")
      let res1 = res?.filter((ob) => ob?.moduleName !== "HOME")
      res = res1.sort((a,b) => a.moduleName.localeCompare(b.moduleName));
      home?.[0] && res.unshift(home[0]);
    }
    else
    {
      res.sort((a,b) => a.moduleName.localeCompare(b.moduleName));
    }
    //reverting the newsidebar change for now, in order to solve ndss login issue
    //let newconfig = restructuringOfConfig(configEmployeeSideBar1);
    //below lines are used for shifting home object to first place
    // newconfig.splice(newconfig.findIndex((ob) => ob?.label === ""),1);
    // newconfig.sort((a,b) => a.label.localeCompare(b.label));
    // const fndindex = newconfig?.findIndex((el) => el?.label === "Home");
    // const homeitem = newconfig.splice(fndindex,1);
    // newconfig.unshift(homeitem?.[0]);
    // return (
    //   newconfig.map((item, index) => {
    //       return <NavItem key={`${item?.label}-${index}`} item={item} />;
    //     })
    // );
    return res?.map((item, index) => {
      return <SubMenu item={item} key={index + 1} />;
    });
  };

  if (isLoading) {
    return <Loader />;
  }
  if (!res) {
    return "";
  }
  // configEmployeeSideBar = {
  //   Complaints:[
  //     {
  //       createdBy: null,
  //       createdDate: null,
  //       displayName: "Open Complaints",
  //       enabled: true,
  //       id: 1557,
  //       lastModifiedBy: null,
  //       lastModifiedDate: null,
  //       leftIcon: "action:announcement",
  //       name: "OpenComplaints",
  //       navigationURL: "/digit-ui/employee/pgr/inbox",
  //       orderNumber: 1,
  //       parentModule: "rainmaker-pgr",
  //       path: "Complaints.MyComplaints",
  //       queryParams: "",
  //       rightIcon: "",
  //       serviceCode: "PGR",
  //       tenantId: "pg",
  //       url: "url"
        
  //     },
  //     {
  //       createdBy: null,
  //     createdDate: null,
  //     displayName: "Open Complaints",
  //     enabled: true,
  //     id: 1557,
  //     lastModifiedBy: null,
  //     lastModifiedDate: null,
  //     leftIcon: "action:announcement",
  //     name: "OpenComplaints",
  //     navigationURL: "/digit-ui/employee/pgr/inbox",
  //     orderNumber: 1,
  //     parentModule: "rainmaker-pgr",
  //     path: "Complaints.MyComplaints",
  //     queryParams: "",
  //     rightIcon: "",
  //     serviceCode: "PGR",
  //     tenantId: "pg",
  //     url: "url"
  //     }
  //   ]
     
     

  //  };

  // //creating the object structure from mdms value for easy iteration
  //  configEmployeeSideBar1 = {
  //   Complaints:[
  //     Closed Complaints:[
          // {
  //       createdBy: null,
  //       createdDate: null,
  //       displayName: "Closed Complaints",
  //       enabled: true,
  //       id: 1557,
  //       lastModifiedBy: null,
  //       lastModifiedDate: null,
  //       leftIcon: "custom:closed-complaints",
  //       name: "ClosedComplaints",
  //       navigationURL: "closed-complaints",
  //       orderNumber: 1,
  //       parentModule: "rainmaker-pgr",
  //       path: "Complaints.Closed Complaints",
  //       queryParams: "",
  //       rightIcon: "",
  //       serviceCode: "PGR",
  //       tenantId: "pg",
  //       url: "url"
        
  //     },
//]
//   Create Complaint:[
  //     {
  //       createdBy: null,
  //     createdDate: null,
  //     displayName: "Open Complaints",
  //     enabled: true,
  //     id: 1557,
  //     lastModifiedBy: null,
  //     lastModifiedDate: null,
  //     leftIcon: "action:announcement",
  //     name: "OpenComplaints",
  //     navigationURL: "/digit-ui/employee/pgr/inbox",
  //     orderNumber: 1,
  //     parentModule: "rainmaker-pgr",
  //     path: "Complaints.MyComplaints",
  //     queryParams: "",
  //     rightIcon: "",
  //     serviceCode: "PGR",
  //     tenantId: "pg",
  //     url: "url"
  //     }
//  ]
//My Complaint:[
  //     {
  //       createdBy: null,
  //     createdDate: null,
  //     displayName: "Open Complaints",
  //     enabled: true,
  //     id: 1557,
  //     lastModifiedBy: null,
  //     lastModifiedDate: null,
  //     leftIcon: "action:announcement",
  //     name: "OpenComplaints",
  //     navigationURL: "/digit-ui/employee/pgr/inbox",
  //     orderNumber: 1,
  //     parentModule: "rainmaker-pgr",
  //     path: "Complaints.MyComplaints",
  //     queryParams: "",
  //     rightIcon: "",
  //     serviceCode: "PGR",
  //     tenantId: "pg",
  //     url: "url"
  //     }
//  ]
  //   ]
  // };
  
  //console.log("configemp", configEmployeeSideBar, configEmployeeSideBar1)
  const renderSearch = () => {
    return (
      <div className="submenu-container">
          <style>
      
         {`
          .citizen .sidebar .sidebar-link:hover,
          .employee .sidebar .sidebar-link:hover {
            color: #7a2829 !important;
            background-color: #486480;
            cursor: pointer;
          }
          .citizen .sidebar .sidebar-link:hover svg,
          .employee .sidebar .sidebar-link:hover svg {
            fill: #7a2829 !important;
          }
          .citizen .sidebar .sidebar-link.active, 
        .employee .sidebar .sidebar-link.active {
            color: #7a2829 !important;
            border-right: 4px solid #7a2829;
        }
        .citizen .sidebar .dropdown-link.active, .employee .sidebar .dropdown-link.active {
          color: #7a2829 !important;
          border-right: 4px solid #7a2829;
        }
        .citizen .sidebar .dropdown-link:hover, .employee .sidebar .dropdown-link:hover {
          color: #7a2829 !important;
          cursor: pointer;
        }
        `}
      </style>
        <div className="sidebar-link">
          <div className="actions search-icon-wrapper">
            <SearchIcon className="search-icon" />
            <input
              className="employee-search-input"
              type="text"
              placeholder={t(`ACTION_TEST_SEARCH`)}
              name="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="sidebar" ref={sidebarRef} onMouseOver={expandNav} onMouseLeave={collapseNav}>
      {renderSearch()}
      {splitKeyValue()}
      
            <div className="submenu-container">
          <div onClick={""} className={`sidebar-link`}>
            <div className="actions">
            <Phone />
              <div data-tip="React-tooltip" data-for={`jk-side-$}`} style={{display:"flex",flexDirection:"column"}}>
                <span>{t("CS_COMMON_HELPLINE")} </span>
                <span>{"6362222593"} </span>
              </div>
            </div>
            {/* <div> {item.links && subnav ? <ArrowVectorDown /> : item.links ? <ArrowForward /> : null} </div> */}
          </div>
        </div>
        <div className="submenu-container">
          <div onClick={""} className={`sidebar-link`}>
            <div className="actions">
            <LogoutIcon style={{fill:"white !important"}}></LogoutIcon>
              <div data-tip="React-tooltip" data-for={`jk-side-$}`} onClick={(e)=> {handleLogout()}}style={{display:"flex",flexDirection:"column"}}>
                <span>{t("CS_COMMON_LOGOUT")} </span>
               
              </div>
            </div>
            {/* <div> {item.links && subnav ? <ArrowVectorDown /> : item.links ? <ArrowForward /> : null} </div> */}
          </div>
          {showDialog && (
        <LogoutDialog onSelect={handleOnSubmit} onCancel={handleOnCancel} onDismiss={handleOnCancel}></LogoutDialog>
      )}
        </div>
       
    </div>
  );
};

export default EmployeeSideBar;
