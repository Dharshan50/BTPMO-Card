import { Version } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-webpart-base';
import { escape } from '@microsoft/sp-lodash-subset';

import styles from './BtpmocardwebpartWebPart.module.scss';
import * as strings from 'BtpmocardwebpartWebPartStrings';

import * as crypto from 'crypto-js';

import * as $ from 'jquery';
import 'select2';
import 'jqueryui';
// Import the Font Awesome styles in your JavaScript/TypeScript file


require('../../../node_modules/bootstrap/dist/css/bootstrap.min.css');
require('../../../node_modules/select2/dist/css/select2.css')
import { SPComponentLoader } from '@microsoft/sp-loader';

SPComponentLoader.loadCss('//code.jquery.com/ui/1.11.4/themes/smoothness/jquery-ui.css');
SPComponentLoader.loadCss('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css');

export interface IBtpmocardwebpartWebPartProps {
  description: string;
}

export default class BtpmocardwebpartWebPart extends BaseClientSideWebPart<IBtpmocardwebpartWebPartProps> {

  public render(): void {

    const siteURL = "https://localhost:4321/temp/workbench.html";
    const apiURL = "https://localhost:7280/api";

    // const apiURL = "https://capleave-dev.coface.dns/BTPMO/api";
    // const siteURL = "https://capleave-dev.coface.dns/BTPMO/api";

    var CurrentUserIdentifier = "2H8H8c4x2l9X4a6Q1j6X";
    var FormNo = 1;
    var ProjectIdentifier = "";
    var UpdateTask = 0;
    var sortFlag = true;
    var taskSortFlag = true;
    var Glbpagenumber = 0;
    var projectTotalRecords = 0;
    var taskTotalRecords = 0;
    var emailId = "";
    var TasksortField = "";
    var TasksortType = "";
    var taskstartPage = 0;
    var taskTotalPage = 0;
    var pageFlag = 1;
    var TasksearchVal = "";


    const listsMap = {
      'ba': balst,
      'dev': devlst,
      'functions': fnctlst,
      'pm': pmlst,
      'tester': testlst
    };

    var balst = [];
    var cntrylst = [];
    var devlst = [];
    var fnctlst = [];
    var functionMasterLst = [];
    var keylst = [];
    var pmlst = [];
    var prjlst = [];
    var raglst = [];
    var resplst = [];
    var stglst = [];
    var stslst = [];
    var testlst = [];
    var prtylst = [];

    var paginationObj = {
      totalRecords: 0,
      currentPage: 1,
      pageSize: 10,
    }

    var ProjectsData = [];
    var ProjectRecordViewObj = {
      projectName: "",
      stages: [],
      stageCount: ""
    };

    var ProjectReqObj = {
      search: "",
      currentPage: 1,
      pageSize: 10,
      sortField: "",
      descFlag: sortFlag,
      batchIdentifier: "",
      userIdentifier: ""
    }

    var ProjectInsertObj = {
      commonProjectidentifier: "",
      category: 1,  // 1-> project ; others -> batch
      tagProjectIdentifier: "",
      commonProjectName: "",
      batchProjectSize: "",
      deadLine: "",
      targetGoLive: "",
      revisedGoLive: "",
      sponsers: "",
      pm: "",
      ba: "",
      baPriority: "",
      dev: "",
      devPriority: "",
      tester1: "",
      tester2: "",
      functionId: "",
      priority: "",
      currentStage: "",
      ragStatus: "",
      ragComment: "",
      userIdentifier: CurrentUserIdentifier
    }

    function goToProjectViewPage() {
      //$('#rqst_cntnt').show();
      $('#view_proj').show();
      $('#proj_summary_tbl').hide();
      $('#pagination_container').hide();
      $('#task_manage').hide();
      // $('#upd_userlog_cmts').show();
    }

    $(document).on('click', '.view_proj_data', function (e) {
      var button = $(this);
      button.html('<div class="spinner-border spinner-border-sm" role="status"><span class="visually-hidden">Loading...</span></div> View');
      currStage = 0;
      let value = (e.target.id).split('-')[1];
      ProjectIdentifier = value;
      ProjectReqObj.batchIdentifier = ProjectIdentifier;
      setTimeout(async () => {
        $('#tab_content_bt').hide();
        $('#crt_tsk').hide();
        //goToProjectViewPage();
        await Do_project_view(ProjectIdentifier);
        button.html('View');
      }, 500);

      // $('.arrow_down').css("transform", "rotate(180deg)");
    })
    var ProjectLogs = []

    function Do_Get_Project_Logs() {
      var commonRqObj = {
        "identifier": ProjectIdentifier,
        "userIdentifier": CurrentUserIdentifier
      }
      var logHTML = '';
      $.ajax({
        url: apiURL + '/Task/DoGetProjectLogs',
        type: 'POST',
        contentType: 'application/json',
        async: false,
        data: JSON.stringify(commonRqObj),
        success: function (result) {
          if (result['data'] != null) {
            ProjectLogs = result['data'];
            if (ProjectLogs.length > 0) {
              var user = {}
              for (let i = 0; i < ProjectLogs.length; i++) {
                var color = "";
                var borderColor = "";
                if (Object.keys(user).indexOf(ProjectLogs[i].empName) != -1) {
                  color = user[ProjectLogs[i].empName];
                  borderColor = darkenColor(color, 0.7);
                }
                else {
                  color = generateRandomLightColor();
                  user[ProjectLogs[i].empName] = color;
                  borderColor = darkenColor(color, 0.7);
                }

                logHTML += `<div class="${styles.upd_cmts_1}">
                        <div class="upd_user_symb" id="upd_user_symb">
                            <p style="margin-top: 12px !important;"><span class="${styles.upd_initial_name}"
                                    style="border: 1px solid ${borderColor} !important; color: ${borderColor} !important; background-color: ${color} !important;">${ProjectLogs[i].empName[0]}</span>
                            </p>
                        </div>
                        <div class="upd_user_cmt">
                            <p style="font-size: 14px;">${ProjectLogs[i].contextText}</p>
                        </div>
                    </div>`;
              }
            }
            else {
              logHTML = `<div class="${styles.upd_cmts_1}">
                                    <div class="upd_user_symb" id="upd_user_symb">
                                        <p style="margin-top: 10px !important;"><span class="${styles.upd_initial_name}"
                                                style="border: 1px solid black !important; color: black !important; background-color: grey !important;">A</span>
                                        </p>
                                    </div>
                                    <div class="upd_user_cmt">
                                        <p style="font-size: 16px;">Admin : No Logs Were Found!<br/>${new Date().toLocaleDateString()}</p>
                                    </div>
                                </div>`
            }
          }
        },
        error: function (e) {
          //alert("error")
          logHTML = `<div class="${styles.upd_cmts_1} ${styles.space_btw_fields}">No logs were Found!</div>`
          console.log(e)
        }
      });
      $('#cmts').html(logHTML)
    }

    function GetUserDetails() {
      var url = apiURL + "/_api/web/currentuser";
      $.ajax({
        url: url,
        headers: {
          Accept: "application/json;odata=verbose"
        },
        async: false,
        success: function (data) {
          var items = data.d.results; // Data will have user object
          emailId = data.d.Email;
          GenerateToken();
          // $('#username').html(data.d.Title);
          // $('#userid').html(data.d.Id);
          // $('#email').html(data.d.Email);
          // $('#adminaccess').html(data.d.IsSiteAdmin);
        },
        error: function (data) {
          alert("An error occurred. Please try again.");
        }
      });
    }

    function GenerateToken() {
      console.log('Generate Token')
      $.ajax({
        url: apiURL + '/Token/DoGetToken',
        type: 'POST',
        contentType: 'application/json',
        async: false,
        data: JSON.stringify({ encryptedemail: emailId }),
        success: function (result) {
          console.log(result);
          sessionStorage.setItem("JWTToken", "");
          CurrentUserIdentifier = "";
        },
        error: function (e) {
          alert("error")
          console.log(e)
        }
      });
    }

    function generateRandomLightColor() {
      // Generate random values for red, green, and blue (closer to 255)
      var red = Math.floor(Math.random() * 100) + 155;
      var green = Math.floor(Math.random() * 100) + 155;
      var blue = Math.floor(Math.random() * 100) + 155;

      // Convert the values to hexadecimal and ensure two digits
      var redHex = ('0' + red.toString(16)).slice(-2);
      var greenHex = ('0' + green.toString(16)).slice(-2);
      var blueHex = ('0' + blue.toString(16)).slice(-2);

      // Concatenate the hexadecimal values to form the color code
      var colorCode = '#' + redHex + greenHex + blueHex;

      return colorCode;
    }
    function darkenColor(color, factor) {
      // Darken the color by reducing its brightness
      const rgb = parseInt(color.slice(1), 16);
      const r = (rgb >> 16) & 0xff;
      const g = (rgb >> 8) & 0xff;
      const b = (rgb >> 0) & 0xff;

      const darkenedR = Math.floor(r * factor);
      const darkenedG = Math.floor(g * factor);
      const darkenedB = Math.floor(b * factor);

      return `rgb(${darkenedR}, ${darkenedG}, ${darkenedB})`;
    }

    function Do_project_view(identifier) {
      arrow_id = "";
      console.log(identifier);
      ProjectReqObj.batchIdentifier = identifier;
      $.ajax({
        url: apiURL + '/Project/GetProjects',
        type: 'POST',
        contentType: 'application/json',
        async: false,
        data: JSON.stringify(ProjectReqObj),
        success: function (result) {
          console.log(result);
          if (result['data'] != null) {
            ProjectRecordViewObj = result['data'];
            goToProjectViewPage();
            BindProjectViewData();
            Do_Get_Project_Logs();
          }
        },
        error: function (e) {
          //alert("error")
          console.log(e)
        }
      });
    }

    function DoBindDropDownValuesProject() {
      for (let i = 0; i < ProjectRecordViewObj.stages.length; i++) {
        let stageObj = ProjectRecordViewObj.stages[i];
        if (stageObj !== null && stageObj !== undefined) {
          for (let j = 0; j < stageObj.tasks.length; j++) {
            let taskObj = stageObj.tasks[j];
            if (taskObj !== null && taskObj !== undefined) {
              if (taskObj && taskObj.status && taskObj.status === 'Not Started') {
                $(`.task_markRag_${taskObj.taskIdentifier}`).css({ 'background-color': "lightblue" })
              }
              else if (taskObj && taskObj.status && taskObj.status === 'InProgress') {
                $(`.task_markRag_${taskObj.taskIdentifier}`).css({ 'background-color': "lightgreen" })
              }
              else if (taskObj && taskObj.status && taskObj.status === 'Needs Help') {
                $(`.task_markRag_${taskObj.taskIdentifier}`).css({ 'background-color': "lightyellolightredw" })
              }
              else if (taskObj && taskObj.status && taskObj.status === 'Delayed') {
                $(`.task_markRag_${taskObj.taskIdentifier}`).css({ 'background-color': "lightred" })
              }
              else if (taskObj && taskObj.status && taskObj.status === 'On Hold') {
                $(`.task_markRag_${taskObj.taskIdentifier}`).css({ 'background-color': "lightorange" })
              }
              else if (taskObj && taskObj.status && taskObj.status === 'Completed') {
                $(`.task_markRag_${taskObj.taskIdentifier}`).css({ 'background-color': "palegreen" })
              }
              else if (taskObj && taskObj.status && taskObj.status === 'N/A') {
                $(`.task_markRag_${taskObj.taskIdentifier}`).css({ 'background-color': "lightbrown" })
              }
              else {
                $(`.task_markRag_${taskObj.taskIdentifier}`).css({ 'background-color': "grey" })
              }
              $(`#task_responsibility_${taskObj.taskIdentifier}`).val(taskObj.responsibilityIdentifier)
              $(`#task_ragStatus_${taskObj.taskIdentifier}`).val(taskObj.statusIdentifier)
            }
          }
        }
      }
    }


    $(document).ready(function () {

      $('.page_content').hide()
      $('.loading_container').show()
      hide_all_details();
      select2_control();
      $('#proj_content').hide();
      $(document).find('.upd_userlog_cmts').hide();
      hide_all_details();
      $('#projectSearchTerm').val("")
      $('#tab1').get(0).click();
      $('#pagination_container').show();
      $('#proj_summary_tbl').show();
      date_picker();
      $('.select2-container').css('border', 'none')
      ProjectReqObj = { ...ProjectReqObj, search: "", currentPage: 1, pageSize: 10, sortField: "", descFlag: true, batchIdentifier: "", userIdentifier: "" };
      ProjectIdentifier = "";
      sortFlag = true;
      $('.page_content').show()
      $('.loading_container').hide()
      // GetUserDetails();


      // $('.page_content').show()
      // $('.loading_container').hide()
      $("[class^='header_']").hide()
      $('.CanvasZone').css('max-width','100%');
      $("[class^='pageContent_']").css('max-width','100%').css('position','none');
      $("#workbenchCommandBar").hide();
      $(".commandBarWrapper").hide();
      $(".ms-compositeHeader").hide();
      $("[class^='imageFrame']").hide()
      $("[class^='banner_']").hide()
    })

    this.domElement.innerHTML = `<div class="container-fluid">
    <div class="${styles.loader_container_div} loading_container">
        <div class="${styles.loader}"></div>
        <p style="margin: 15px 10px;">Loading...</p>
    </div>
<div class="container page_content mb-5" style="display:none" >
<div id="tab_content_bt">
    <div class="${styles.tabwrap} mt-1">
        <input type="radio" id="tab1" name="tabGroup1" class="${styles.tab}">
        <label id="bt_proj_tab" for="tab1">Project Summary</label>

        <input type="radio" id="tab2" name="tabGroup1" class="${styles.tab}">
        <label id="bt_task_tab" for="tab2">Task Management</label>
    </div>
</div>
<div id="proj_summary_tbl">
    <div class="${styles.bt_process_tab} mt-3">
        <div class="${styles.btn_proj}">
            <button type="button" class="btn btn-success ${styles.btn_create_proj}" style="padding: 8px 15px !important;"
                id="create_proj"><i class="fa-solid fa-plus" style="margin-right: 8px;"></i>Create
                Project</button>
        </div>
        <div class="${styles.serch_box}">
            <div class="${styles.search_icon_grp}" style="width: 140% !important;">
                <input id="projectSearchTerm" type="text" class="form-control ${styles.formtxt_box_chng}"
                    style="width: 100% !important; margin-left: -1.3rem !important;" placeholder="Search">
                <i id="projectGridSearch" class="fas fa-search" style="cursor:pointer;right: 30px !important; top:52% !important"></i>
            </div>
        </div>
    </div>
    <div class="table-responsive mt-1 proj_summ_table" id="tbl_all_prj">
        <div>
            <table class="table table-responsive ${styles.tbl_all_proj}" id="tblprojsummary" cellspacing="0">
                <thead style="font-size: 14px;">
                    <tr >
                        <th class="${styles.small_column_width}">Actions</th>
                        <th id="projectId" class="${styles.small_column_width} project_grid_sort" >Project Id</th>
                        <th id="projectName" class="${styles.big_column_width} project_grid_sort" >Project Name</th>
                        <th id="tagName" class="${styles.big_column_width} project_grid_sort" >Tag Project Name</th>
                        <th id="projectSize" class="${styles.big_column_width} project_grid_sort" >Project Size</th>
                        <th id="deadline" class="${styles.small_column_width} project_grid_sort" >DeadLine</th>
                        <th id="targetGoLive" class="${styles.small_column_width} project_grid_sort" >Target-go-live</th>
                        <th id="revisedGoLive" class="${styles.small_column_width} project_grid_sort" >Revised-go-live</th>
                        <th id="sponsers" class="${styles.small_column_width} project_grid_sort" >Sponsers</th>
                        <th id="pm" class="${styles.small_column_width} project_grid_sort" >PM</th>
                        <th id="ba" class="${styles.small_column_width} project_grid_sort" >BA</th>
                        <th id="baPriority" class="${styles.small_column_width} project_grid_sort" >BA Priority</th>
                        <th id="dev" class="${styles.small_column_width} project_grid_sort" >Dev</th>
                        <th id="devPriority" class="${styles.small_column_width} project_grid_sort" >Dev Priority</th>
                        <th id="functionId" class="${styles.small_column_width} project_grid_sort" >Function</th>
                        <th id="priority" class="${styles.small_column_width} project_grid_sort" >Priority</th>
                        <th id="currentStage" class="${styles.small_column_width} project_grid_sort" >Current Stage</th>
                        <th id="ragStatus" class="${styles.small_column_width} project_grid_sort" >RAG Status</th>
                        <th id="ragComment" class="${styles.big_column_width} project_grid_sort" >RAG Comments</th>
                    </tr>
                </thead>
                <tbody id="project_grid_rec" style="font-size: 11px;"> 
                    <tr>
                        <td style="text-align:center !important" colspan="19">No Records Found...</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>
<div id="task_manage">
    <div class="${styles.task_tabwrap} mt-4" style="font-size: 13px; margin-right: 25px !important;">
        <input type="radio" id="task_tab1" name="task_tabGroup1" class="${styles.task_tab}" checked value = "1">
        <label id="bt_proj_tab" for="task_tab1" style="border-right: none;">ToDo</label>

        <input type="radio" id="task_tab2" name="task_tabGroup1" class="${styles.task_tab}" checked value = "2">
        <label id="bt_task_tab" for="task_tab2" style="border-right: none;">OverDue</label>

        <input type="radio" id="task_tab3" name="task_tabGroup1" class="${styles.task_tab}" checked value = "3">
        <label id="bt_task_tab" for="task_tab3" style="border-right: none;">Current Week</label>

        <input type="radio" id="task_tab4" name="task_tabGroup1" class="${styles.task_tab}" checked value = "4">
        <label id="bt_task_tab" for="task_tab4" style="border-right: none;">Previous Week</label>

        <input type="radio" id="task_tab5" name="task_tabGroup1" class="${styles.task_tab}" checked value = "5">
        <label id="bt_task_tab" for="task_tab5">Next Week</label>
    </div>
    <div class="${styles.task_inner_filt} mt-4">
        <div class="${styles.task_inner_tabwrap}" style="font-size: 13px;">
            <input type="radio" id="task_inner_tab1" name="task_inner_tabGroup1" class="${styles.task_inner_tab}" checked value = "1">
            <label id="bt_proj_tab" for="task_inner_tab1" style="border-right: none;">All</label>

            <input type="radio" id="task_inner_tab2" name="task_inner_tabGroup1" class="${styles.task_inner_tab}" checked value = "2">
            <label id="bt_task_tab" for="task_inner_tab2" style="border-right: none;">Assigned By Others</label>

            <input type="radio" id="task_inner_tab3" name="task_inner_tabGroup1" class="${styles.task_inner_tab}" checked value = "3">
            <label id="bt_task_tab" for="task_inner_tab3">Assigned To Me</label>
        </div>
        <div class="task_${styles.serch_box}">
            <div class="${styles.search_icon_grp}" style="width: 140% !important;">
                <input type="text" class="form-control ${styles.formtxt_box_chng}"
                    style="width: 93% !important; margin-left: 0rem !important;" placeholder="Search" id="srch_tsk">
                <i class="fas fa-search ${styles.search_icon}" id = "tsk_srch_icon"style="right: 30px !important; top:52% !important; cursor:pointer;"></i>
            </div>
        </div>
    </div>
    <div class="table-responsive mt-3" id="task_tbl">
        <table class="table table-responsive tbl_all_pro ${styles.tbl_all_proj}" id = "tsk_tbl">
            
        </table>
    </div>
</div>
<div id="pagination_container" class="${styles.pagination_cont_dv}" style="display:none;">
    <div class="pagination_filter_container">
        <div>
            <span id="current_pagenumber"></span> |
            <span id="total_records"></span>
            <span style="margin-left:15px;">
                <label>View Records</label>
                <select id="page_filter" style="margin-bottom:15px;">
                    <option value="1">1</option>
                    <option value="5">5</option>
                    <option value="10" selected>10</option>
                    <option value="15">15</option>
                    <option value="20">20</option>
                    <option value="25">25</option>
                    <option value="30">30</option>
                </select>
            </span>
        </div>
    </div>
    <div id="pagination_div"></div>
</div>

<div class="requst_form" id="rqst_cntnt">
    <section class="create_proj_content" id="proj_content" style="margin-top: 0px !important;">
        <div class="${styles.content_head_title}">
            <div class="${styles.return_main_btn} ">
                <i style='font-size:18px' class='fas ${styles.retrn_main_page}' id="return_projectgrid">&#xf060;</i>
            </div>
            <div class="${styles.content_title_head}">
                <h3 class="${styles.content_head_name}">Create Project</h3>
            </div>
        </div>
        <div class="create_proj_form" id="create_proj_form">
            <div class="row ${styles.space_btw_fields}">
                <!--
                    <div class="col-lg-2 col-12">
                        <label for="project_form_commonProjectName" class="form-label ${styles.label_txt_chng}">Project Name</label> <span class="${styles.mandatory}">*</span>
                    </div>
                    <div class="col-lg-2 col-12">
                        <input type="text" placeholder="Project Name" class="form-control project_form_style ${styles.text_box_project}" id="project_form_commonProjectName">
                    </div>
                    <div class="col-lg-2 col-12">
                            <label for="project_form_category" class="form-label ${styles.label_txt_chng}">Project Type</label> <span class="${styles.mandatory}">*</span>
                    </div>
                    <div class="col-lg-2 col-12">
                        <select id="project_form_category" class="form-select project_form_style ${styles.text_box_project}">
                            <option selected value="1">Project</option>
                            <option value="2">Batch Project</option>
                        </select>
                    </div>
                    <div class="projectList col-lg-2 col-12">
                        <label for="project_form_tagProject" class="form-label ${styles.label_txt_chng}">Main Project</label> <span class="${styles.mandatory}">*</span>
                    </div>
                    <div class="projectList col-lg-2 col-12">
                        <input type="text" placeholder="Tag Project Name" class="form-control project_form_style ${styles.text_box_project}" id="project_form_tagProject">
                        <select id="project_form_tagProject" class="form-select project_form_style ${styles.text_box_project}">
                            <option value="" hidden >Select</option>
                            <option value="1">Test</option>
                        </select>
                    </div>
                -->
            </div>
        <div class="row ${styles.space_btw_fields}">
            <div class="col-lg-2 col-12">
                <label for="project_form_commonProjectName" class="form-label ${styles.label_txt_chng}">Project Name</label> <span class="${styles.mandatory}">*</span>
            </div>
            <div class="col-lg-2 col-12">
                <input type="text" placeholder="Project Name" class="form-control project_form_style ${styles.text_box_project}" id="project_form_commonProjectName">
            </div>
            <div class="col-lg-2 col-12">
                <label for="project_form_batchProjectSize" class="form-label ${styles.label_txt_chng}">Project Size</label> <span class="${styles.mandatory}">*</span>
            </div>
            <div class="col-lg-2 col-12">
                <select id="project_form_batchProjectSize" class="form-select project_form_style ${styles.text_box_project}">
                </select>
            </div>
            <div class="col-lg-2 col-12">
                <label for="project_form_deadLine" class="form-label ${styles.label_txt_chng}">DeadLine</label> <span class="${styles.mandatory}">*</span>
            </div>
            <div class="col-lg-2 col-12">
                <select id="project_form_deadLine" class="form-select project_form_style ${styles.text_box_project}">
                <option value="" hidden >Select</option>
                    <option value="Q1">Q1</option>
                    <option value="Q2">Q2</option>
                    <option value="Q3">Q3</option>
                    <option value="Q4">Q4</option>
                </select>
            </div>
        </div>
            <div class="row ${styles.space_btw_fields}">
                <div class="col-lg-2 col-12">
                    <label for="project_form_targetGoLive" class="form-label ${styles.label_txt_chng}">Target-go-live</label> <span class="${styles.mandatory}">*</span>
                </div>
                <div class="col-lg-2 col-12">
                    <div class="${styles.cal_icon_grp}">
                        <input type="text" class="form-control project_form_style ${styles.text_box_project}" id="project_form_targetGoLive"
                            placeholder="DD-MM-YYYY">
                        <i class="fa-regular fa-calendar"></i>
                    </div>
                </div>
                <div class="col-lg-2 col-12">
                    <label for="project_form_revisedGoLive" class="form-label ${styles.label_txt_chng}">Revised-go-live</label> 
                </div>
                <div class="col-lg-2 col-12">
                    <div class="${styles.cal_icon_grp}">
                        <input type="text" class="form-control project_form_style ${styles.text_box_project}" id="project_form_revisedGoLive"
                            placeholder="DD-MM-YYYY">
                        <i class="fa-regular fa-calendar"></i>
                    </div>
                </div>
                <div class="col-lg-2 col-12">
                    <label for="project_form_sponsers" class="form-label ${styles.label_txt_chng}">Sponsers</label>
                </div>
                <div class="col-lg-2 col-12">
                    <input type="text" placeholder="Sponsers" class="form-control project_form_style ${styles.text_box_project}" id="project_form_sponsers">
                </div>
            </div>
            <div class="row ${styles.space_btw_fields}">
                <div class="col-lg-2 col-12">
                    <label for="project_form_pm" class="form-label ${styles.label_txt_chng}">PM</label> <span class="${styles.mandatory}">*</span>
                </div>
                <div class="col-lg-2 col-12">
                    <div class="${styles.search_icon_grp}">
                        <select class = "form-select project_form_style ${styles.text_box_project}" id ="project_form_pm" placeholder = "">
                        </select>
                        <i class="fas fa-search"></i>
                    </div>
                </div>
                <div class="col-lg-2 col-12">
                    <label for="project_form_ba" class="form-label ${styles.label_txt_chng}">BA</label> <span class="${styles.mandatory}">*</span>
                </div>
                <div class="col-lg-2 col-12">
                    <div class="${styles.search_icon_grp}">
                        <select class = "form-select project_form_style ${styles.text_box_project}" id = "project_form_ba" placeholder = "">
                        </select>
                        <i class="fas fa-search"></i>
                    </div>
                </div>
                <div class="col-lg-2 col-12">
                <label for="project_form_baPriority" class="form-label ${styles.label_txt_chng}">BA Priority</label> <span class="${styles.mandatory}">*</span>
            </div>
            <div class="col-lg-2 col-12">
                <select class="form-select project_form_style ${styles.text_box_project}" id="project_form_baPriority">
                <option value="" selected disabled>Select</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                </select>
            </div>
            </div>
            <div class="row ${styles.space_btw_fields}">
                <div class="col-lg-2 col-12">
                    <label for="project_form_dev" class="form-label ${styles.label_txt_chng}">Dev</label> <span class="${styles.mandatory}">*</span>
                </div>
                <div class="col-lg-2 col-12">
                    <div class="${styles.search_icon_grp}">
                        <select class = "form-select project_form_style ${styles.text_box_project}" id = "project_form_dev" placeholder = "">
                        </select>
                        <i class="fas fa-search"></i>
                    </div>

                </div>
                <div class="col-lg-2 col-12">
                <label for="project_form_devPriority" class="form-label ${styles.label_txt_chng}" id="proj_dev2">Dev Priority</label> <span class="${styles.mandatory}">*</span>
            </div>
            <div class="col-lg-2 col-12">
                <select class="form-select project_form_style ${styles.text_box_project}" id="project_form_devPriority">
                <option value="" selected disabled>Select</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                </select>
            </div>
                <div class="col-lg-2 col-12">
                    <label for="project_form_tester1" class="form-label ${styles.label_txt_chng}">Tester 1</label>
                </div>
                <div class="col-lg-2 col-12">
                    <div class="${styles.search_icon_grp}">
                        <select class = "form-select project_form_style ${styles.text_box_project}" id = "project_form_tester1" placeholder = "">
                        </select>
                        <i class="fas fa-search"></i>
                    </div>
                </div>
            </div>
            <div class="row ${styles.space_btw_fields}">
                <div class="col-lg-2 col-12">
                    <label for="project_form_tester2" class="form-label ${styles.label_txt_chng}">Tester 2</label>
                </div>
                <div class="col-lg-2 col-12">
                    <div class="${styles.search_icon_grp}">
                        <select class = "form-select project_form_style ${styles.text_box_project}" id = "project_form_tester2" placeholder = "">
                        </select>
                        <i class="fas fa-search"></i>
                    </div>
                </div>
                <div class="col-lg-2 col-12">
                    <label for="project_form_functionId" class="form-label ${styles.label_txt_chng}">Function</label> <span class="${styles.mandatory}">*</span>
                </div>
                <div class="col-lg-2 col-12">
                    <select id="project_form_functionId" class="form-select project_form_style ${styles.text_box_project}">
                    
                    </select>
                </div>
                <div class="col-lg-2 col-12">
                    <label for="project_form_priority" class="form-label ${styles.label_txt_chng}">Priority</label> <span class="${styles.mandatory}">*</span>
                </div>
                <div class="col-lg-2 col-12">
                    <select id="project_form_priority" class="form-select project_form_style ${styles.text_box_project}">
                    
                    </select>
                </div>
            </div>
            <div class="${styles.content_head_title} ${styles.space_btw_fields}">
                <div class="${styles.content_title_head} mt-2">
                    <h3 class="${styles.content_head_name}" style="margin-left: 4px !important;">Project Status</h3>
                </div>
            </div>
            <div class="row ${styles.space_btw_fields}">
                <div class="col-lg-2 col-12">
                    <label for="project_form_currentStage" class="form-label ${styles.label_txt_chng}">Current Stage</label> <span class="${styles.mandatory}">*</span>
                </div>
                <div class="col-lg-2 col-12">
                    <select id="project_form_currentStage" class="form-select project_form_style ${styles.text_box_project}">
                    
                    </select>
                </div>
                <div class="col-lg-2 col-12">
                    <label for="project_form_ragStatus" class="form-label ${styles.label_txt_chng}">RAG Status</label> <span class="${styles.mandatory}">*</span>
                </div>
                <div class="col-lg-2 col-12">
                    <select id="project_form_ragStatus" class="form-select project_form_style ${styles.text_box_project}">
                    
                    </select>
                </div>
            </div>
            <div class="row ${styles.space_btw_fields}">
                <div class="col-lg-2 col-12">
                    <label for="project_form_ragComment" class="form-label ${styles.label_txt_chng}">RAG Comments</label>
                </div>
                <div class="col-lg-6 col-12">
                    <textarea placeholder="Comments" id="project_form_ragComment" rows="3" class="form-control project_form_style ${styles.textarea_box_chng}"></textarea>
                </div>
            </div>
        </div>
    </section>
    <section class="create_task-content" id="task_content" style="margin-top: 0px !important;">
        <div class="${styles.content_head_title}">
            <div class="${styles.return_main_btn}">
                <i style='font-size:18px;color: #447E32;cursor: pointer;margin-left: 12px;' class='fas'
                    id="retrn_task_page">&#xf060;</i>
            </div>
            <div class="${styles.content_title_head}">
                <h3 class="${styles.content_head_name}" id ="tsk_head">Create Task</h3>
            </div>
        </div>
        <div class="row ${styles.space_btw_fields}">
            <div class="col-lg-2 col-12">
                <label for="task_taskid" class="form-label ${styles.label_txt_chng}">Task Id</label>
            </div>
            <div class="col-lg-2 col-12">
                <input type="text" class="form-control ${styles.text_box_project}" id="task_taskid" value="T0006"
                    disabled style=" cursor: not-allowed;">
            </div>
            <div class="col-lg-2 col-12">
                <label for="task_dependentid" class="form-label ${styles.label_txt_chng}">Dependent Task Id</label>
            </div>
            <div class="col-lg-2 col-12">
                <input type="text" class="form-control ${styles.text_box_project}" id="task_dependentid" value="DT00006"
                    disabled style=" cursor: not-allowed;">
            </div>
            <div class="col-lg-2 col-12">
                <label for="task_stage" class="form-label ${styles.label_txt_chng}">Stage <span class="${styles.mandatory_fields_imp}">*</span></label>
            </div>
            <div class="col-lg-2 col-12">
                <select id="task_stage" class="form-select ${styles.text_box_project}">
                </select>
            </div>
        </div>
        <div class="row ${styles.space_btw_fields}">
            <div class="col-lg-2 col-12">
                <label for="task_keysteps" class="form-label ${styles.label_txt_chng}">Key Steps <span class="${styles.mandatory_fields_imp}">*</span></label>
            </div>
            <div class="col-lg-2 col-12">
                <select id="task_keysteps" class="form-select ${styles.text_box_project}">
                
                </select>
            </div>
            <div class="col-lg-2 col-12">
                <label for="task_resp" class="form-label ${styles.label_txt_chng}">Resp <span class="${styles.mandatory_fields_imp}">*</span></label>
            </div>
            <div class="col-lg-2 col-12">
                <div class="${styles.search_icon_grp}">
                    <select class = "form-select ${styles.text_box_project}" id = "task_resp">
                    </select>
                    <i class="fas fa-search"></i>
                </div>
            </div>
            <div class="col-lg 2 col-12">
                <label for="task_responsibility" class="form-label ${styles.label_txt_chng}">Responsibility <span class="${styles.mandatory_fields_imp}">*</span></label>
            </div>
            <div class="col-lg-2 col-12">
                <div class="${styles.search_icon_grp}">
                        <select class ="form-select ${styles.text_box_project}" id ="task_responsibility">
                        </select>
                    <i class="fas fa-search"></i>
                </div>
            </div>
        </div>
        <div class="row ${styles.space_btw_fields}">
            <div class="col-lg-2 col-12">
                <label for="task_descrip" class="form-label ${styles.label_txt_chng}">Task Description</label>
            </div>
            <div class="col-lg-6 col-12">
                <textarea id="task_descrip" rows="5" class="form-control ${styles.textarea_box_chng}"></textarea>
            </div>
            <div class="col-lg-2 col-12">
                <label for="task_status" class="form-label ${styles.label_txt_chng}">Status <span class="${styles.mandatory_fields_imp}">*</span></label>
            </div>
            <div class="col-lg 2 col-12">
                <select id="task_status" class="form-select ${styles.text_box_project}">
                
                </select>
            </div>
        </div>
        <div class="row ${styles.space_btw_fields}">
            <div class="col-lg-2 col-12">
                <label for="task_commentsbt" class="form-label ${styles.label_txt_chng}">Comments(BT)</label>
            </div>
            <div class="col-lg-2 col-12">
                <textarea id="task_commentsbt" rows="4" class="form-control ${styles.textarea_box_chng}"
                    style="width:120% !important"></textarea>
            </div>
            <div class="col-lg-2 col-12">
                <label for="task_commentspm" class="form-label ${styles.label_txt_chng}">Comments(PM)</label>
            </div>
            <div class="col-lg-2 col-12">
                <textarea id="task_commentspm" rows="4" class="form-control ${styles.textarea_box_chng}"
                    style="width:120% !important"></textarea>
            </div>
        </div>
        <div class="row ${styles.space_btw_fields}">
            <div class="col-lg-2">
                <label for="task_startdate" class="form-label ${styles.label_txt_chng}">Start Date <span class="${styles.mandatory_fields_imp}">*</span></label>
            </div>
            <div class="col-lg-2 col-12">
                <div class="${styles.cal_icon_grp}"> 
                    <input type="text" class="form-control ${styles.text_box_project}" id="task_startdate_new"
                        placeholder="DD-MM-YYYY">
                    <i class="fa-regular fa-calendar"></i>
                </div>
            </div>
            <div class="col-lg-2 col-12">
                <label for="task_estmandays" class="form-label ${styles.label_txt_chng}">Estimated Man Days <span class="${styles.mandatory_fields_imp}">*</span></label>
            </div>
            <div class="col-lg-2 col-12">
                <input type="text" class="form-control ${styles.text_box_project}" id="task_estmandays_new">
            </div>
            <div class="col-lg-2 col-12">
                <label for="task_enddate" class="form-label ${styles.label_txt_chng}">End Date </label>
            </div>
            <div class="col-lg-2 col-12">
                <div class="${styles.cal_icon_grp}">
                    <input type="text" class="form-control ${styles.text_box_project}" id="task_enddate_new"
                        placeholder="DD-MM-YYYY">
                    <i class="fa-regular fa-calendar"></i>
                </div>
            </div>
        </div>
        <div class="row ${styles.space_btw_fields}">
            <div class="col-lg-2 col-12">
                <label for="task_revisedstartdate" class="form-label ${styles.label_txt_chng}">Revised Start Date <span class="${styles.mandatory_fields_imp}">*</span></label>
            </div>
            <div class="col-lg-2 col-12">
                <div class="${styles.cal_icon_grp}">
                    <input type="text" class="form-control ${styles.text_box_project}" id="task_revisedstartdate_new"
                        placeholder="DD-MM-YYYY">
                    <i class="fa-regular fa-calendar"></i>
                </div>
            </div>
            <div class="col-lg-2 col-12">
                <label for="task_revisemandays" class="form-label ${styles.label_txt_chng}">Revised Man Days <span class="${styles.mandatory_fields_imp}">*</span></label>
            </div>
            <div class="col-lg-2 col-12">
                <input type="text" class="form-control ${styles.text_box_project}" id="task_revisemandays_new">
            </div>
            <div class="col-lg-2 col-12">
                <label for="task_revisedenddate" class="form-label ${styles.label_txt_chng}">Revised End Date </label>
            </div>
            <div class="col-lg-2 col-12">
                <div class="${styles.cal_icon_grp}">
                    <input type="text" class="form-control ${styles.text_box_project}" id="task_revisedenddate_new"
                        placeholder="DD-MM-YYYY">
                    <i class="fa-regular fa-calendar"></i>
                </div>
            </div>
        </div>
        <div class="row ${styles.space_btw_fields}">
            <div class="col-lg-2 col-12">
                <label for="task_acutalmandays" class="form-label ${styles.label_txt_chng}">Actual Man Days <span class="${styles.mandatory_fields_imp}">*</span></label>
            </div>
            <div class="col-lg-2 col-12">
                <input type="text" class="form-control ${styles.text_box_project}" id="task_acutalmandays">
            </div>
            <div class="col-lg-2 col-12">
                <label for="task_allocationperday" class="form-label ${styles.label_txt_chng}">Allocation Per Day <span class="${styles.mandatory_fields_imp}">*</span></label>
            </div>
            <div class="col-lg-2 col-12">
                <input type="text" class="form-control ${styles.text_box_project}" id="task_allocationperday">
            </div>
            <!--<div class="col-lg-2 col-12">
                <label for="task_actualstatus" class="form-label ${styles.label_txt_chng}">Status</label>
            </div>
            <div class="col-lg-2 col-12">
                <select id="task_actualstatus" class="form-select ${styles.text_box_project}">
                
                </select>
            </div>-->
        </div>
        <div class="row ${styles.space_btw_fields}">
            <div class="col-lg-2 col-12">
                <label for="task_closuredate" class="form-label ${styles.label_txt_chng}">Closure Date <span class="${styles.mandatory_fields_imp}">*</span></label>
            </div>
            <div class="col-lg-2 col-12">
                <div class="${styles.cal_icon_grp}">
                    <input type="text" class="form-control ${styles.text_box_project}" id="task_closuredate"
                        placeholder="DD-MM-YYYY">
                    <i class="fa-regular fa-calendar"></i>
                </div>
            </div>
        </div>
    </section>
    <section class="update_task_page" id="update_task" style="margin-top: 0px !important;">
        <div class="${styles.content_head_title}">
            <div class="${styles.return_main_btn}">
                <i style="font-size:18px; color: #447E32;cursor: pointer;margin-left: 12px;" class='fas'
                    id="retrn_task">&#xf060;</i>
            </div>
            <div class="${styles.content_title_head}">
                <h3 class="${styles.content_head_name}">Update Task - <span id="UpdateTaskName">T00001</span></h3>
            </div>
        </div>

        <div class="table-responsive ${styles.space_btw_fields}" id="upd_task_tbl">
            <table class="table">
                <thead style="font-size: 12px;">
                    <tr>
                        <th style="min-width: 125px;">Actions</th>
                        <th style="min-width: 125px;">Start Date</th>
                        <th style="min-width: 125px;">Estimated Man Days</th>
                        <th style="min-width: 125px;">End Date</th>
                        <th style="min-width: 125px;">Revised Start Date</th>
                        <th style="min-width: 125px;">Revised Man Days</th>
                        <th style="min-width: 125px;">Revised End Date</th>
                        <th style="min-width: 125px;">Actual Man Days</th>
                        <th style="min-width: 125px;">Allocation Per Day</th>
                        <th style="min-width: 125px;">Closure Date</th>
                        <th style="min-width: 125px;">Status</th>
                        <th style="min-width: 125px;">Reason For Revision</th>
                    </tr>
                </thead>
                <tbody style="font-size: 12px; max-height:300px ;overflow-y: scroll;" id="tbl_task_dates">
                    
                </tbody>
            </table>
            <p>No. of Records : <span id="TaskDatesCount"></span></p>
        </div>


    </section>

    <section class="view_proj_project" id="view_proj" style="margin-top: 0px !important;">
        <div class="${styles.content_head_title}">
            <div class="${styles.return_main_btn} ">
                <i style='font-size:18px' class='fas ${styles.retrn_main_page}' id="retrn_menu">&#xf060;</i>
            </div>
            <div class="${styles.content_title_head}">
                <h3 id="batch_project_title" class="${styles.content_head_name}">Project Name</h3>
            </div>
            <div class="${styles.create_task_btn}">
                <button type="button" class="bt btn-success ${styles.btn_create_proj}"
                    style="font-size: 15px !important; padding: 5px 12px !important;" id="crt_tsk"><i
                        class="fa-solid fa-plus" style="margin-right: 10px;"></i>Create Task</button>
            </div>
        </div>
        <div id="project_stage_task_view" style="font-size: 12px; text-align:center">
        
        </div>
    </section>

    <div class="upd_userlog_cmts ${styles.space_btw_fields}" id="upd_userlog_cmts">
        <div class="upd_task_userlog_title" id="task_userlog_title" >
            <div class="${styles.tabwrap} mt-1">
                <label id="bt_proj_tab" style="color: white; display: inline-block; background-color: #08305c; padding: 5px 30px;" for="task_tab">User Log Management</label>
            </div>
        </div>
        <div id="cmts" style="margin-top: 35px; max-height: 200px; overflow-y: auto;">
        </div>
    </div>

    <div class="text-center btn_center mt-4" id="buttons" style="display: none;">
        <button class="btn ${styles.submitbtn} submit" id="DoSubmit">Save</button>
        <button class="btn ${styles.cancel_btn}" id="DoCancel">Cancel</button>
    </div>
</div>
</div></div>
  `;

    var lst = [];
    var currStage = 0;

    function select2_control() {
      $('#project_form_pm').select2({
        placeholder: "Search",
        allowClear: true
      });
      $('#project_form_ba').select2({
        placeholder: "Search",
        allowClear: true
      });
      // $('#project_form_baPriority').select2({
      //     placeholder: "Search",
      //     allowClear: true
      // });
      $('#project_form_dev').select2({
        placeholder: "Search",
        allowClear: true
      });
      // $('#project_form_devPriority').select2({
      //     placeholder: "Search",
      //     allowClear: true
      // });
      $('#project_form_tester1').select2({
        placeholder: "Search",
        allowClear: true
      });
      $('#project_form_tester2').select2({
        placeholder: "Search",
        allowClear: true
      });
      $('#task_resp').select2({
        placeholder: "Search",
        allowClear: true
      })
      $('#task_responsibility').select2({
        placeholder: "Search",
        allowClear: true
      })
    }

    $('#projectGridSearch').on('click', function () {
      if ($("#projectSearchTerm").val())
        ProjectReqObj.search = $("#projectSearchTerm").val()
      else {
        ProjectReqObj.search = "";
      }
      pagechanger(0);
      DoGetProjectRecordsMethod();
    });

    $('#projectSearchTerm').keypress(function (event) {
      if (event.keyCode === 13) {
        if ($("#projectSearchTerm").val())
          ProjectReqObj.search = $("#projectSearchTerm").val();
        else {
          ProjectReqObj.search = ""
        }
        pagechanger(0);
        DoGetProjectRecordsMethod();
      }
    });
    $('#tsk_srch_icon').on('click', function () {
      if ($("#srch_tsk").val())
        TasksearchVal = $("#projectSearchTerm").val()
      else {
        TasksearchVal = "";
      }
      pagechanger(0);
      DoGetTaskManagementData();
    });

    $('#srch_tsk').keypress(function (event) {
      if (event.keyCode === 13) {
        if ($("#srch_tsk").val())
          TasksearchVal = $("#srch_tsk").val();
        else {
          TasksearchVal = ""
        }
        pagechanger(0);
        DoGetTaskManagementData();
      }
    });

    function truncateString(str, maxLength = 30) {
      if (str.length <= maxLength) {
        return str;
      } else {
        return str.slice(0, maxLength) + "...";
      }
    }

    // $('#project_form_category').on('change', function () {
    //     if ($('#project_form_category').val() !== "1") {
    //         $('.projectList').show()
    //     }
    //     else {
    //         $('.projectList').hide()
    //     }
    //     ProjectInsertObj = { ...ProjectInsertObj, category: Number($('#proj_category').val()) };
    // });

    var TaskIdentifier = "";
    var taskIdentifier = "";
    var TaskId = "";

    function BindProjectViewData() {
      if (ProjectRecordViewObj != null) {
        lst = []
        console.log('ProjectRecordViewObj', ProjectRecordViewObj);
        $("#batch_project_title").html(ProjectRecordViewObj.projectName)
        var strHtml = "";

        if (ProjectRecordViewObj.stages != null && ProjectRecordViewObj.stages.length != 0) {
          for (let i = 0; i < ProjectRecordViewObj.stages.length; i++) {
            let stageObj = ProjectRecordViewObj.stages[i];
            if (stageObj !== null && stageObj !== undefined) {
              lst.push(stageObj.stageIdentifier);

              strHtml +=
                `<div class="accordion" style="margin-bottom: 4px;" id="acc_${stageObj.stageIdentifier}">
                                <h2 class="accordion-header" >
                                    <button class="accordion-button collapsed ${styles.accordian_head}" type="button"
                                        data-bs-toggle="collapse" data-bs-target="#${stageObj.stageName + '_data'}"
                                        aria-expanded="true" aria-controls="${stageObj.stageName + '_data'}">
                                        <div style = "display : flex; gap:7px;">
                                        <i class="fa-solid fa-angle-down" id="arrow_down_${stageObj.stageIdentifier}" style="color: #fff; margin-right: 0px; font-size: 20px; margin-top: 0px; font-weight: 600 !important;"></i>
                                        <span>${stageObj.stageName}</span>
                                        </div>
                                    </button>
                                </h2>
                            </div> 
                            <div class="${stageObj.stageName}_body" style="max-height:300px; overflow-y:scroll">`

              for (let j = 0; j < stageObj.tasks.length; j++) {
                let taskObj = stageObj.tasks[j];
                if (taskObj !== null && taskObj !== undefined) {
                  strHtml += `
                                <div class="${styles.card_main_box}   show data_${stageObj.stageIdentifier}">
                                    <div class="${styles.card_heda}">
                                        <div>
                                            <p class="${styles.card_head_para}">${taskObj.keyStep ? taskObj.keyStep : "N/A"}</p>
                                        </div>
                                        <div>
                                            <button type="button" title="Edit" id="EditRecord_${taskObj.taskIdentifier}" class="btn btn-success  ${styles.btn_upd_task}" style=" margin-top:6px !important; margin-right:5px !important;">
                                                Edit
                                            </button>
                                            <button type="button" title="Save" id="UpdateRecord_${taskObj.taskIdentifier}" name='${ProjectIdentifier + '_' + stageObj.stageIdentifier}' style="display:none; margin-top:6px !important; margin-right:10px !important;"
                                                class="btn btn-success ${styles.btn_upd_task}">
                                                Save
                                            </button>
                                            <button type="button" title="Cancel" id="Close_${taskObj.taskIdentifier}" style="display:none; margin-top:6px !important; margin-right:10px !important; background-color:#dc3545 !important;" class="btn btn-danger ${styles.btn_upd_task}">
                                                Cancel
                                            </button>
                                            <button type="button" class="btn btn-success ${styles.btn_upd_task} updt_proj" class = "${styles.btn_upd_task}" id="UpdateTask_${taskObj.taskIdentifier}" name="${taskObj.taskId}" >
                                                Update
                                            </button>
                                        </div>
                                    </div>
                                    <div class="${styles.card_bdy}" id="card_bdy_${taskObj.taskIdentifier}">
                                      
                                        <!--<div class="${styles.edit_btn_card}">
                                            <button type="button" title="Edit" id="EditRecord_${taskObj.taskIdentifier}" class="btn btn-gray p-1 py-0 " style=" margin-top:5px !important; margin-right:10px !important;">
                                                <i class="far fa-edit"></i> 
                                            </button>
                                            <button type="button" title="Save" id="UpdateRecord_${taskObj.taskIdentifier}" name='${ProjectIdentifier + '_' + stageObj.stageIdentifier}' style="display:none; margin-top:5px !important; margin-right:10px !important;"
                                                class="btn btn-success p-1 py-0 ">
                                                <i class="far fa-check-square"></i>
                                            </button>
                                            <button type="button" title="Cancel" id="Close_${taskObj.taskIdentifier}" style="display:none; margin-top:5px !important; margin-right:5px !important;" class="btn btn-danger p-1 py-0 ">
                                                <i class="far fa-window-close"></i>
                                            </button>
                                        </div>-->
                                        <div class="${styles.card_cnt}">
                                            <div class="${styles.card_cnt_inner_odd} on">
                                                <p class="${styles.card_label}" style = "margin-bottom:0rem !important;">Start Date : </p>
                                                <p class="${styles.card_main_p_tag}">
                                                    <input type="text" placeholder="DD-MM-YYYY" id="task_startDate_${taskObj.taskIdentifier}"
                                                        class="form-control  ${styles.card_label} task_date ${styles.label_txt_chng} project_input_${taskObj.taskIdentifier} table_input_box_chng_sml table_input_box_chng_sml_${taskObj.taskIdentifier}  "
                                                        value='${taskObj.startDate}' style="font-size: 12px;padding: 3px 3px;">
                                                    <label style=" width: 100px; text-align: left; margin-bottom:0rem !important;" class="project_label_${taskObj.taskIdentifier}">${taskObj.startDate ? taskObj.startDate : "N/A"}</label>
                                                </p>
                                            </div>
                                            <div class="${styles.card_cnt_inner_even}">
                                                <p class="${styles.card_label}" style = "margin-bottom:0rem !important;">Estimated Man Days : </p>
                                                <p class="${styles.card_main_p_tag}">
                                                    <input type="text" id="task_estManDays_${taskObj.taskIdentifier}"
                                                        value='${taskObj.estManDays ? taskObj.estManDays : 0}'
                                                        class="numberbox ${styles.card_label} form-control table_input_box_chng_sml table_input_box_chng_sml_${taskObj.taskIdentifier}  project_input_${taskObj.taskIdentifier}"
                                                        style="font-size: 12px;padding: 3px 3px;">
                                                    <label style=" width: 100px; text-align: left; margin-bottom:0rem !important;" class="project_label_${taskObj.taskIdentifier}" >${taskObj.estManDays ? taskObj.estManDays : "0"}</label>
                                                </p> 
                                            </div>
                                            <div class="${styles.card_cnt_inner_odd}">
                                                <p class="${styles.card_label}" style = "margin-bottom:0rem !important;">End Date : </p>
                                                <p class="${styles.card_main_p_tag}">
                                                    <input type="text" placeholder="DD-MM-YYYY" id="task_endDate_${taskObj.taskIdentifier}" disabled
                                                        class="form-control ${styles.card_label} task_date  ${styles.label_txt_chng} project_input_${taskObj.taskIdentifier} table_input_box_chng_sml table_input_box_chng_sml_${taskObj.taskIdentifier} "
                                                        value='${taskObj.endDate}' style="font-size: 12px; cursor: not-allowed;padding: 3px 3px;">
                                                    <label style=" width: 100px; text-align: left; margin-bottom:0rem !important;" class="project_label_${taskObj.taskIdentifier}" >${taskObj.endDate}</label>
                                                </p>
                                            </div>
                                            
                                            <div class="${styles.card_cnt_inner_even}">
                                                <p class="${styles.card_label}" style = "margin-bottom:0rem !important;">Status : </p>
                                                <p class="${styles.card_main_p_tag}">
                                                    <select type="text" id="task_ragStatus_${taskObj.taskIdentifier}"
                                                        class=" project_input_${taskObj.taskIdentifier} form-select ${styles.card_label} ragStatusProjectDrop table_input_box_chng_sml table_input_box_chng_sml_${taskObj.taskIdentifier}  project_input_${taskObj.taskIdentifier}"
                                                        style="font-size: 12px;padding: 3px 3px;">
                                                        <option selected value="">Select</>`

                  for (let c = 0; c < stslst.length; c++) {
                    strHtml += `<option value="${stslst[c].configureIdentifier}">${stslst[c].configureName}</>`
                  }

                  strHtml += `
                                                    </select>
                                                    <mark style=" width: 100px; text-align: center; background-color: #BDE8F0; color:white;"
                                                        class="task_markRag_${taskObj.taskIdentifier}  project_label_${taskObj.taskIdentifier} ${styles.rag_status}">${taskObj.status ? taskObj.status : "N/A"}</mark>
                                                </p>
                                            </div>
                                          </div>
                                          <div class = "${styles.card_cnt}">
                                            <div class="${styles.card_cnt_inner_even}" style = "width:70% !important;">
                                                <p class="${styles.card_label}" style = "margin-bottom:0rem !important;">Task Description:</p>
                                                <p class="${styles.card_main_p_tag}">
                                                    <input type="text" id="task_taskDescription_${taskObj.taskIdentifier}" disabled
                                                        class="form-control ${styles.card_label} table_input_box_chng_sml table_input_box_chng_sml_${taskObj.taskIdentifier}  project_input_${taskObj.taskIdentifier}"
                                                        value='${taskObj.taskDescription}' style="font-size: 12px; cursor: not-allowed;padding: 3px 3px;">
                                                    <label class="project_label_${taskObj.taskIdentifier}"
                                                        title="${taskObj.taskDescription ? taskObj.taskDescription : "N/A"}" style="width : 100%; text-align: left; margin-bottom:0rem !important;">${taskObj.taskDescription ? taskObj.taskDescription : "N/A"}</label>
                                                </p>
                                            </div>
                                            
                                            
                                            <div class="${styles.card_cnt_inner_odd} on">
                                                <p class="${styles.card_label}" style = "margin-bottom:0rem !important;">Resp. : </p>
                                                <p class="${styles.card_main_p_tag}">
                                                    <input type="text" id="task_resp_${taskObj.taskIdentifier}" class="form-control ${styles.card_label} table_input_box_chng_sml table_input_box_chng_sml_${taskObj.taskIdentifier}  project_input_${taskObj.taskIdentifier}" value='${taskObj.resp}' style="font-size: 12px; cursor: not-allowed;padding: 3px 3px;">
                                                    <label style=" width: 100px; text-align: left; margin-bottom:0rem !important;" class="project_label_${taskObj.taskIdentifier}">${taskObj.resp ? taskObj.resp : "N/A"}</label>
                                                </p>
                                            </div>
                                            </div>
                                            <div class = "${styles.card_cnt}">
                                            <div class="${styles.card_cnt_inner_even}">
                                                <p class="${styles.card_label}" style = "margin-bottom:0rem !important;">Responsibility : </p>
                                                <p style=" text-align: left;" class = "${styles.card_main_p_tag}">
                                                    <select type="text" id="task_responsibility_${taskObj.taskIdentifier}" class="form-select ${styles.card_label} responsibilityProjectDrop table_input_box_chng_sml table_input_box_chng_sml_${taskObj.taskIdentifier}  project_input_${taskObj.taskIdentifier}" style="font-size: 12px;padding: 3px 3px;">
                                                        <option selected value="">Select</>`

                  if (taskObj.resp != null && taskObj.resp.toLowerCase() === 'ba') {
                    for (let c = 0; c < balst.length; c++) {
                      strHtml += `<option value="${balst[c].configureIdentifier}">
                                                                                            ${balst[c].configureName}</>`
                    }
                  }
                  else if (taskObj.resp != null && taskObj.resp.toLowerCase() === 'dev') {
                    for (let c = 0; c < devlst.length; c++) {
                      strHtml += `<option
                                                                                            value="${devlst[c].configureIdentifier}">${devlst[c].configureName}</>`
                    }
                  }
                  else if (taskObj.resp != null && taskObj.resp.toLowerCase() === 'functions') {
                    for (let c = 0; c < fnctlst.length; c++) {
                      strHtml += `<option
                                                                                            value="${fnctlst[c].configureIdentifier}">${fnctlst[c].configureName}</>`
                    }
                  }
                  else if (taskObj.resp != null && taskObj.resp.toLowerCase() === 'pm' || taskObj.resp.toLowerCase() === 'pmo') {
                    for (let c = 0; c < pmlst.length; c++) {
                      strHtml += `<option value="${pmlst[c].configureIdentifier}">
                                                                                            ${pmlst[c].configureName}</>`
                    }
                  }
                  else if (taskObj.resp != null && taskObj.resp.toLowerCase() === 'tester') {
                    for (let c = 0; c < testlst.length; c++) {
                      strHtml += `<option
                                                                                            value="${testlst[c].configureIdentifier}">${testlst[c].configureName}</>`
                    }
                  }

                  strHtml += `
                                                    </select>
                                                    <label style=" width: 100px; text-align: left; margin-bottom:0rem !important;" class="project_label_${taskObj.taskIdentifier}">${taskObj.responsibility ? taskObj.responsibility : "N/A"}</label>
                                                </p>
                                            </div>
                                            <div class="${styles.card_cnt_inner_even}">
                                                <p class="${styles.card_label}" style = "margin-bottom:0rem !important;">Revised Start Date : </p>
                                                <p class="${styles.card_main_p_tag}">
                                                    <input type="text" placeholder="DD-MM-YYYY" id="task_revisedStartDate_${taskObj.taskIdentifier}"
                                                        class="form-control ${styles.card_label} task_date ${styles.label_txt_chng}  project_input_${taskObj.taskIdentifier} table_input_box_chng_sml table_input_box_chng_sml_${taskObj.taskIdentifier}  project_input_${taskObj.taskIdentifier}"
                                                        value='${taskObj.revisedStartDate}' style="font-size: 12px;padding: 3px 3px;">
                                                    <label style=" width: 100px; text-align: left; margin-bottom:0rem !important;" class="project_label_${taskObj.taskIdentifier}" >${taskObj.revisedStartDate ? taskObj.revisedStartDate : "N/A"}</label>
                                                </p>
                                            </div>
                                            <div class="${styles.card_cnt_inner_odd}">
                                                <p class="${styles.card_label}" style = "margin-bottom:0rem !important;">Revised Man Days : </p>
                                                <p class="${styles.card_main_p_tag}">
                                                    <input type="text" id="task_revisedManDays_${taskObj.taskIdentifier}"
                                                        value='${taskObj.revisedManDays ? taskObj.revisedManDays : 0}'
                                                        class="numberbox ${styles.card_label} form-control table_input_box_chng_sml table_input_box_chng_sml_${taskObj.taskIdentifier}  project_input_${taskObj.taskIdentifier}"
                                                        style="font-size: 12px;padding: 3px 3px;">
                                                    <label style=" width: 100px; text-align: left; margin-bottom:0rem !important;" class="project_label_${taskObj.taskIdentifier}">${taskObj.revisedManDays ? taskObj.revisedManDays : "0"}</label>
                                                </p>
                                            </div>

                                            <div class="${styles.card_cnt_inner_even} on">
                                                <p class="${styles.card_label}" style = "margin-bottom:0rem !important;">Revised End Date : </p>
                                                <p class="${styles.card_main_p_tag}">
                                                    <input type="text" placeholder="DD-MM-YYYY" disabled
                                                        class="form-control ${styles.card_label} task_date project_input_${taskObj.taskIdentifier} ${styles.label_txt_chng}  table_input_box_chng_sml table_input_box_chng_sml_${taskObj.taskIdentifier} "
                                                        id="task_revisedEndDate_${taskObj.taskIdentifier}" value='${taskObj.revisedEndDate}'
                                                        style="font-size: 12px; cursor: not-allowed;padding: 3px 3px;">
                                                    <label style=" width: 100px; text-align: left; margin-bottom:0rem !important;" class="project_label_${taskObj.taskIdentifier}" >${taskObj.revisedEndDate ? taskObj.revisedEndDate : "0"}</label>
                                                </p>
                                            </div>
                                            </div>
                                            <div class = "${styles.card_cnt}">
                                            <div class="${styles.card_cnt_inner_odd}">
                                                <p class="${styles.card_label}" style = "margin-bottom:0rem !important;">Allocation Per Day : </p>
                                                <p class="${styles.card_main_p_tag}">
                                                    <input type="text" id="task_actualManDays_${taskObj.taskIdentifier}"
                                                        value='${taskObj.actualManDays ? taskObj.actualManDays : 0}'
                                                        class="numberbox ${styles.card_label} form-control table_input_box_chng_sml table_input_box_chng_sml_${taskObj.taskIdentifier}  project_input_${taskObj.taskIdentifier}"
                                                        style="font-size: 12px;padding: 3px 3px;">
                                                    <label style=" width: 100px; text-align: left; margin-bottom:0rem !important;" class="project_label_${taskObj.taskIdentifier}" >${taskObj.actualManDays ? taskObj.actualManDays : 0}</label>
                                                </p>
                                            </div>
                                            <div class="${styles.card_cnt_inner_even}">
                                                <p class="${styles.card_label}" style = "margin-bottom:0rem !important;">Allocation Per Day : </p>
                                                <p class="${styles.card_main_p_tag}">
                                                    <input type="text" id="task_allocationPerDay_${taskObj.taskIdentifier}"
                                                        value='${taskObj.allocationPerDay ? taskObj.allocationPerDay : 0}'
                                                        class="numberbox ${styles.card_label} form-control table_input_box_chng_sml table_input_box_chng_sml_${taskObj.taskIdentifier}  project_input_${taskObj.taskIdentifier}"
                                                        style="font-size: 12px;padding: 3px 3px;">
                                                    <label style=" width: 100px; text-align: left; margin-bottom:0rem !important;" class="project_label_${taskObj.taskIdentifier}" >${taskObj.allocationPerDay ? taskObj.allocationPerDay : 0}</label>
                                                </p>
                                            </div>
                                            <div class="${styles.card_cnt_inner_odd}">
                                                <p class="${styles.card_label}" style = "margin-bottom:0rem !important;">Clousure Date : </p>
                                                <p class="${styles.card_main_p_tag}">
                                                    <input type="text" placeholder="DD-MM-YYYY" id="task_clousureDate_${taskObj.taskIdentifier}"
                                                        value='${taskObj.clousureDate}'
                                                        class="form-control ${styles.card_label} task_date ${styles.label_txt_chng}  table_input_box_chng_sml table_input_box_chng_sml_${taskObj.taskIdentifier}  project_input_${taskObj.taskIdentifier}"
                                                        style="font-size: 12px;padding: 3px 3px;">
                                                    <label class="project_label_${taskObj.taskIdentifier}" style=" width: 100px; text-align: left; margin-bottom:0rem !important;">${taskObj.clousureDate ? taskObj.clousureDate : "N/A"}</label>
                                                </p>
                                            </div>

                                            <div class="${styles.card_cnt_inner_odd}">
                                                <p class="${styles.card_label}" style = "margin-bottom:0rem !important;">Task ID : </p>
                                                <p class="${styles.card_main_p_tag}">
                                                    <input type="text" id="task_taskid_${taskObj.taskIdentifier}" class="form-control ${styles.card_label} table_input_box_chng_sml table_input_box_chng_sml_${taskObj.taskIdentifier}  project_input_${taskObj.taskIdentifier}" value='${taskObj.taskId}' style="font-size: 12px; cursor: not-allowed;padding: 3px 3px;">
                                                    <label style=" width: 100px; text-align: left; margin-bottom:0rem !important;" class="project_label_${taskObj.taskIdentifier}">${taskObj.taskId}</label>
                                                </p>
                                            </div>
                                            </div>
                                            <div class = "${styles.card_cnt}">
                                            <div class="${styles.card_cnt_inner_even}">
                                                <p class="${styles.card_label}" style = "margin-bottom:0rem !important;">Dependent TaskID : </p>
                                                <p class="${styles.card_main_p_tag}">
                                                    <input type="text" id="task_dependent_${taskObj.taskIdentifier}" class="form-control ${styles.card_label} table_input_box_chng_sml table_input_box_chng_sml_${taskObj.taskIdentifier}  project_input_${taskObj.taskIdentifier}" value='${taskObj.dependentId}' style="font-size: 12px; cursor: not-allowed;padding: 3px 3px;">
                                                    <label style=" width: 100px; text-align: left; margin-bottom:0rem !important;" class="project_label_${taskObj.taskIdentifier}">${taskObj.dependentId}</label>
                                                </p>
                                            </div>
                                            <div class="${styles.card_cnt_inner_odd}">
                                                <p class="${styles.card_label}" style = "margin-bottom:0rem !important;">KeyStep : </p>
                                                <p class="${styles.card_main_p_tag}">
                                                    <input type="text" id="task_keyStep_${taskObj.taskIdentifier}" class="form-control ${styles.card_label} table_input_box_chng_sml table_input_box_chng_sml_${taskObj.taskIdentifier}  project_input_${taskObj.taskIdentifier}" value='${taskObj.keyStep}' style="font-size: 12px; cursor: not-allowed;padding: 3px 3px;">
                                                    <label style=" width: 100px; text-align: left; margin-bottom:0rem !important;" class="project_label_${taskObj.taskIdentifier}" title="${taskObj.keyStep ? taskObj.keyStep : "N/A"}">${taskObj.keyStep ? taskObj.keyStep : "N/A"}</label>
                                                </p>
                                            </div>
                                            
                                            <div class="${styles.card_cnt_inner_odd} on">
                                                <p class="${styles.card_label}" style = "margin-bottom:0rem !important;">BT Comments : </p>
                                                <p class="${styles.card_main_p_tag}">
                                                    <input type="text" id="task_btComments_${taskObj.taskIdentifier}"
                                                        class="form-control ${styles.card_label} table_input_box_chng_sml table_input_box_chng_sml_${taskObj.taskIdentifier}  project_input_${taskObj.taskIdentifier}"
                                                        value='${taskObj.btComments}' style="font-size: 12px;padding: 3px 3px;">
                                                    <label style=" width: 100px; text-align: left;" class="project_label_${taskObj.taskIdentifier}" title="${taskObj.btComments ? taskObj.btComments : "N/A"}">${taskObj.btComments ? truncateString(taskObj.btComments) : "N/A"}</label>
                                                </p>
                                            </div>
                                            <div class="${styles.card_cnt_inner_even}">
                                                <p class="${styles.card_label}" style = "margin-bottom:0rem !important;">PM Comments : </p>
                                                <p class="${styles.card_main_p_tag}">
                                                    <input type="text" id="task_pmComments_${taskObj.taskIdentifier}"
                                                        class="form-control ${styles.card_label} table_input_box_chng_sml table_input_box_chng_sml_${taskObj.taskIdentifier}  project_input_${taskObj.taskIdentifier}"
                                                        value='${taskObj.pmComments}' style="font-size: 12px;padding: 3px 3px;">
                                                    <label style=" width: 100px; text-align: left; margin-bottom:0rem !important;" class="project_label_${taskObj.taskIdentifier}" title="${taskObj.pmComments ? taskObj.pmComments : "N/A"}">${taskObj.pmComments ? truncateString(taskObj.pmComments) : "N/A"}</label>
                                                </p>
                                            </div>
                                            
                                            <i onclick="click_on()" title="More Details" id="card_arrow_${taskObj.taskIdentifier}" class="fa-solid fa-ellipsis arrow_down card_arrow_${taskObj.taskIdentifier} ${styles.card_down_arrow}"></i>
                                        </div>
                                    </div>
                                   
                                    </div> 
                                  `;
                }
              }
              strHtml += '</div>';
            }
          }
        }
        else {
          strHtml = '<div><p style="text-align:center">No Stages Found...</p></div>'
        }
        $('#project_stage_task_view').html(strHtml);
        $(document).find('.upd_userlog_cmts').show();
        // $(document).find('#cmts').show();
        Do_Get_Project_Logs()

        $('.task_calender').hide()
        $('.table_input_box_chng_sml').css({ 'border': '1px solid grey', 'border-radius': '0px' });
        $(".table_input_box_chng_sml").prop("disabled", true).css('cursor', 'not-allowed');
        $("[class^='project_label_']").show();
        $('.table_input_box_chng_sml').hide();
        DoBindDropDownValuesProject();
        $("[class^='task_calender_']").hide();
        console.log(lst)

        for (let i = 0; i < lst.length; i++) {
          if (i === currStage) {
            TaskId = lst[i];
            $('.data_' + lst[i]).show();
            $('#arrow_down_' + lst[i]).css("transform", "rotate(180deg)");
          }
          else {
            $('.data_' + lst[i]).hide();
          }
        }
      }
    }

    $(document).on('click', "[id^='acc_']", function () {
      //  //alert(1)
      var temp_id = this.id;
      var splitArray = temp_id.split('_');
      var id = splitArray[splitArray.length - 1];

      if (id === TaskId) {
        // //alert(2)
        for (let i = 0; i < lst.length; i++) {
          $('.data_' + lst[i]).hide();
          $('#arrow_down_' + lst[i]).css("transform", "rotate(360deg)", "transition", "0.5s");
          if (arrow_id != "") {
            $(`#card_bdy_${id}`).css({ 'max-height': '1000px' });
          }
        }
        TaskId = "";
      } else {
        ////alert(3)
        for (let i = 0; i < lst.length; i++) {
          if (lst[i] === id) {
            // //alert(4)
            TaskId = id;
            currStage = i;
            $('.data_' + lst[i]).show();
            $('#arrow_down_' + lst[i]).css("transform", "rotate(180deg)", "transition", "0.5s");
          } else {
            // //alert(5)
            $('.data_' + lst[i]).hide();
            $('#arrow_down_' + lst[i]).css("transform", "rotate(360deg)", "transition", "0.5s");

          }
        }
      }

      // Reset rotation for all accordions

    });
    var arrow_id = "";

    $(document).on('click', `[id^='card_arrow_']`, function () {
      var temp_id = this.id;
      var splitArray = temp_id.split('_');
      var id = splitArray[splitArray.length - 1];

      if (arrow_id !== id) {
        $('#card_arrow_' + id).removeClass('fa-arrow-circle-down')
        arrow_id = id;
        $(`#card_bdy_${id}`).css({ 'max-height': '1000px', 'transition': 'max-height:0.8s' });
        $('#card_arrow_' + id).addClass('fa-arrow-circle-up')
      }
      else {
        $('#card_arrow_' + id).removeClass('fa-arrow-circle-UP')
        $(`#card_bdy_${id}`).css({ 'max-height': '135px', 'transition': 'max-height:0.8s' });
        $('#card_arrow_' + id).addClass('fa-arrow-circle-down')
        arrow_id = "";
      }
    })


    $(document).on("click", ".project_grid_sort", function () {
      sortFlag = !sortFlag;
      var FieldName = this.id;
      ProjectReqObj.sortField = FieldName;
      ProjectReqObj.descFlag = sortFlag;
      ProjectReqObj.batchIdentifier = "";
      ProjectReqObj.search = $('#projectSearchTerm').val();
      DoGetProjectRecordsMethod();
    })

    $(document).on("click", ".task_sort_field", function () {
      taskSortFlag = !taskSortFlag;
      TasksortField = this.id;
      if (taskSortFlag) {
        TasksortType = "asc";
      }
      else {
        TasksortType = "desc";
      }
      DoGetTaskManagementData();
    })

    $(document).on("click", "[id^='EditRecord_']", function () {

      if (TaskIdentifier !== "") {
        $(`.project_input_${TaskIdentifier}`).prop("disabled", true).css('cursor', 'not-allowed');
        $(`.project_input_${TaskIdentifier}`).hide();
        $(`.project_label_${TaskIdentifier}`).show();
        $(`.fa-calendar${TaskIdentifier}`).prop("disabled", false).css('cursor', 'auto');
        BindProjectViewData();
        $(`#UpdateRecord_${TaskIdentifier}`).hide()
        $(`#Close_${TaskIdentifier}`).hide()
        $(`#EditRecord_${TaskIdentifier}`).show()
        $(`[class^='task_calender_${TaskIdentifier}']`).hide();
        $(`[class^='task_calender_${TaskIdentifier}']`).prop("disabled", true).css('cursor', 'not-allowed');
      }
      // if (TaskIdentifier === "") {

      var temp_id = this.id;
      var splitArray = temp_id.split('_');
      var id = splitArray[splitArray.length - 1];
      TaskIdentifier = id;

      var current_style = $(`#card_bdy_${id}`).css('max-height')
      if (current_style === "135px") {
        $(`#card_bdy_${id}`).css({ 'max-height': '135px', 'transition': 'max-height:0.8s' });
      }

      $(`#card_bdy_${id}`).css({ 'max-height': '1000px', 'transition': 'max-height:0.8s' });
      $(`[class^='card_main_p_tag_']`).css({'width' : '100%'});

      $(`.project_input_${id}`).prop("disabled", false).css('cursor', 'auto');;
      $(`[class^='task_calender_${id}']`).show();
      $(`[class^='task_calender_${id}']`).prop("disabled", false).css('cursor', 'auto');;
      //access
      $(`#task_taskid_${id}`).prop("disabled", true).css('cursor', 'not-allowed');
      $(`#task_dependent_${id}`).prop("disabled", true).css('cursor', 'not-allowed');
      $(`#task_stage_${id}`).prop("disabled", true).css('cursor', 'not-allowed');
      $(`#task_keyStep_${id}`).prop("disabled", true).css('cursor', 'not-allowed');
      $(`#task_resp_${id}`).prop("disabled", true).css('cursor', 'not-allowed');
      $(`#task_taskDescription_${id}`).prop("disabled", true).css('cursor', 'not-allowed');
      $(`#task_endDate_${id}`).prop("disabled", true).css('cursor', 'not-allowed');
      $(`#task_revisedEndDate_${id}`).prop("disabled", true).css('cursor', 'not-allowed');
      $(`.fa-calendar${id}`).prop("disabled", false).css('cursor', 'auto');;

      $(`.project_input_${id}`).show();
      $(`.project_label_${id}`).hide();

      $(`#UpdateRecord_${id}`).show()
      $(`#Close_${id}`).show()
      $(`#EditRecord_${id}`).hide()
      $(`.table_input_box_chng_sml_${id}`).css({ 'border': '1px solid grey', 'border-radius': '0px' });
      date_picker();
      // }
    });

    $(document).on("click", "[id^='UpdateRecord_']", function () {

      var button = $(this);
      var text = button.html();
      button.html('<div class="spinner-border spinner-border-sm" role="status"><span class="visually-hidden">Loading...</span></div>');

      var temp_id = this.id;
      var splitArray = temp_id.split('_');
      var id = splitArray[splitArray.length - 1];
      TaskIdentifier = id;
      var data = this.name.split('_');
      var projectId = data[0];
      var stageId = data[1];
      $(`.table_input_box_chng_sml_${id}`).css({ 'border': '1px solid grey', 'border-radius': '0px' });

      setTimeout(async () => {
        await DoUpdateGridTaskProjectView(id, stageId);
        button.html(text);
      }, 500);

    });

    $(document).on("click", "[id^='Close_']", function () {
      var temp_id = this.id;
      var splitArray = temp_id.split('_');
      var id = splitArray[splitArray.length - 1];
      TaskIdentifier = id;

      $(`.project_input_${id}`).prop("disabled", true).css('cursor', 'not-allowed');
      $(`.project_input_${id}`).hide();
      $(`.project_label_${id}`).show();
      $(`.fa-calendar${id}`).prop("disabled", false).css('cursor', 'auto');

      BindProjectViewData();

      var current_style = $(`#card_bdy_${id}`).css('max-height')
      $(`[class^='card_main_p_tag_']`).css({'width' : ''});

      if (current_style === "135px") {
        $(`#card_bdy_${id}`).css({ 'max-height': '135px', 'transition': 'max-height:0.8s' });
      }
      arrow_id = "";
      // $(`card_arrow_${id}`).get(0).click();

      $('#card_arrow').trigger('click')
      $(`#UpdateRecord_${id}`).hide()
      $(`#Close_${id}`).hide()
      $(`#EditRecord_${id}`).show()
      $(`[class^='task_calender_${id}']`).hide();
      $(`[class^='task_calender_${id}']`).prop("disabled", true).css('cursor', 'not-allowed');
      TaskIdentifier = "";
    });

    $(document).on("click", "[id^='UpdateTask_']", function () {
      var button = $(this);
      button.html('<div class="spinner-border spinner-border-sm py-1" role="status" style = "font-size:16px;"><span class="visually-hidden">Loading...</span></div> Update');

      $('#pagination_container').hide();
      if (TaskIdentifier !== "") {
        $(`.project_input_${TaskIdentifier}`).prop("disabled", true).css('cursor', 'not-allowed');
        $(`.project_input_${TaskIdentifier}`).hide();
        $(`.project_label_${TaskIdentifier}`).show();
        $(`.fa-calendar${TaskIdentifier}`).prop("disabled", false).css('cursor', 'auto');;
        BindProjectViewData();
        $(`#UpdateRecord_${TaskIdentifier}`).hide()
        $(`#Close_${TaskIdentifier}`).hide()
        $(`#EditRecord_${TaskIdentifier}`).show()
        $(`[class^='task_calender_${TaskIdentifier}']`).hide();
        $(`[class^='task_calender_${TaskIdentifier}']`).prop("disabled", true).css('cursor', 'not-allowed');
      }

      var temp_id = this.id;
      var splitArray = temp_id.split('_');
      var id = splitArray[splitArray.length - 1];
      TaskIdentifier = id;
      TaskId = this.name;
      setTimeout(async () => {
        await DoGetDatesForTask(id);
        button.html('View');
      }, 500);
    });

    $(document).on("change", "[id^='task_startDate_']", function () {
      var temp_id = this.id;
      var splitArray = temp_id.split('_');
      var id = splitArray[splitArray.length - 1];
      TaskIdentifier = id;
      CalculateEndDate(id, 'task_startDate_', 'task_estManDays_', 'task_endDate_')
    });

    $(document).on("change", "[id^='task_estManDays_']", function () {
      var temp_id = this.id;
      var splitArray = temp_id.split('_');
      var id = splitArray[splitArray.length - 1];
      TaskIdentifier = id;
      CalculateEndDate(id, 'task_startDate_', 'task_estManDays_', 'task_endDate_')
    });

    $(document).on("change", "[id^='task_revisedManDays_']", function () {
      var temp_id = this.id;
      var splitArray = temp_id.split('_');
      var id = splitArray[splitArray.length - 1];
      TaskIdentifier = id;
      CalculateEndDate(id, 'task_revisedStartDate_', 'task_revisedManDays_', 'task_revisedEndDate_')
    });

    $(document).on("change", "[id^='task_revisedStartDate_']", function () {
      var temp_id = this.id;
      var splitArray = temp_id.split('_');
      var id = splitArray[splitArray.length - 1];
      TaskIdentifier = id;
      CalculateEndDate(id, 'task_revisedStartDate_', 'task_revisedManDays_', 'task_revisedEndDate_')
    });

    function CalculateEndDate(id, startDateField, manDaysField, endDateField) {
      ////alert(1);
      var startDateString = $(`#${startDateField}${id}`).val();
      var startDate = convertToDateObject(startDateString);
      var revisedManDays = parseFloat($(`#${manDaysField}${id}`).val());
      if (!revisedManDays) {
        revisedManDays = 0;
      }
      if (!isNaN(startDate.getTime())) {
        var endDate = new Date(startDate.getTime() + revisedManDays * 24 * 60 * 60 * 1000);
        var day = endDate.getDate();
        var month = endDate.getMonth() + 1; // Note: month is zero-indexed, so add 1
        var year = endDate.getFullYear();//.toString().slice(-2); // Get last two digits of the year

        // Pad day and month with leading zeros if needed
        let strDay = day < 10 ? '0' + day : day;
        let strMonth = month < 10 ? '0' + month : month;

        var revisedEndDate = strDay + '-' + strMonth + '-' + year;
        // //alert(revisedEndDate);
        $(`#${endDateField}${id}`).val(revisedEndDate);
      } else {
        console.error("Invalid start date");
      }
    }

    function DoClearValuesOfTask() {
      clear_Task_Validation();
      $('#task_taskid').val("T001").prop('disabled', true);
      $('#task_dependentid').val("DT001").prop('disabled', true);
      $('#task_stage').val("").prop('disabled', false);
      $('#task_keysteps').val("").prop('disabled', false);
      $('#task_responsibility').val("").prop('disabled', false);
      $('#task_resp').val("").prop('disabled', false);
      $('#task_descrip').val("").prop('disabled', false);
      $('#task_status').val("").prop('disabled', false);
      $('#task_commentsbt').val("").prop('disabled', false);
      $('#task_commentspm').val("").prop('disabled', false);
      $('#task_startdate_new').val("").prop('disabled', false);
      $('#task_estmandays_new').val("").prop('disabled', false);
      $('#task_enddate_new').val("").prop('disabled', true);
      $('#task_revisedstartdate_new').val("").prop('disabled', false);
      $('#task_revisemandays_new').val("").prop('disabled', false);
      $('#task_revisedenddate_new').val("").prop('disabled', true);
      $('#task_acutalmandays').val("").prop('disabled', false);
      $('#task_allocationperday').val("").prop('disabled', false);
      $('#task_closuredate').val("").prop('disabled', false);

    }

    function convertToDateObject(dateString) {
      var parts = dateString.split('-');
      if (parts.length === 3) {
        var formattedDate = parts[2] + '-' + parts[1] + '-' + parts[0];
        return new Date(formattedDate);
      } else {
        return null; // Return null for invalid date format
      }
    }

    function DoUpdateGridTaskProjectView(id, stageId) {
      let flag = true;
      let task_responsibility = "";
      let task_taskDescription = "";
      let task_ragStatus = "";
      let task_btComments = "";
      let task_pmComments = "";
      let task_startDate = "";
      let task_estManDays = "";
      let task_enddate = "";
      let task_revisedStartDate = "";
      let task_revisedManDays = "";
      let task_revisedEndDate = "";
      let task_actualManDays = "";
      let task_allocationPerDay = "";
      let task_clousureDate = "";

      task_responsibility = $(`#task_responsibility_${id}`).val();
      task_taskDescription = $(`#task_taskDescription_${id}`).val();
      task_ragStatus = $(`#task_ragStatus_${id}`).val();
      task_btComments = $(`#task_btComments_${id}`).val();
      task_pmComments = $(`#task_pmComments_${id}`).val();
      task_startDate = $(`#task_startDate_${id}`).val();
      task_estManDays = $(`#task_estManDays_${id}`).val();
      task_enddate = $(`#task_endDate_${id}`).val();
      task_revisedStartDate = $(`#task_revisedStartDate_${id}`).val();
      task_revisedManDays = $(`#task_revisedManDays_${id}`).val();
      task_revisedEndDate = $(`#task_revisedEndDate_${id}`).val();
      task_actualManDays = $(`#task_actualManDays_${id}`).val();
      task_allocationPerDay = $(`#task_allocationPerDay_${id}`).val();
      task_clousureDate = $(`#task_clousureDate_${id}`).val();

      if (task_responsibility === null || task_responsibility.length === 0) {
        $(document).find(`#task_responsibility_${id}`).css({ 'border': '1px solid red' });
        if (flag)
          $(document).find(`#task_responsibility_${id}`).focus();
        flag = false;

      }
      if (task_taskDescription === null || task_taskDescription.length === 0) {
        $(document).find(`#task_taskDescription_${id}`).css({ 'border': '1px solid red' });
        if (flag)
          $(document).find(`#task_taskDescription_${id}`).focus();
        flag = false;
      }
      if (task_ragStatus === null || task_ragStatus.length === 0) {
        $(document).find(`#task_ragStatus_${id}`).css({ 'border': '1px solid red' });
        if (flag)
          $(document).find(`#task_ragStatus_${id}`).focus();
        flag = false;
      }
      if (task_btComments === null || task_btComments.length === 0) {
        $(document).find(`#task_btComments_${id}`).css({ 'border': '1px solid red' });
        if (flag)
          $(document).find(`#task_btComments_${id}`).focus();
        flag = false;
      }
      if (task_pmComments === null || task_pmComments.length === 0) {
        $(document).find(`#task_pmComments_${id}`).css({ 'border': '1px solid red' });
        if (flag)
          $(document).find(`#task_pmComments_${id}`).focus();
        flag = false;
      }
      if (task_startDate === null || task_startDate.length === 0) {
        $(document).find(`#task_startDate_${id}`).css({ 'border': '1px solid red' });
        if (flag)
          $(document).find(`#task_startDate_${id}`).focus();
        flag = false;
      }
      if (task_estManDays === null || task_estManDays.length === 0) {
        $(document).find(`#task_estManDays_${id}`).css({ 'border': '1px solid red' });
        if (flag)
          $(document).find(`#task_estManDays_${id}`).focus();
        flag = false;
      }
      if (task_enddate === null || task_enddate.length === 0) {
        $(document).find(`#task_endDate_${id}`).css({ 'border': '1px solid red' });
        if (flag)
          $(document).find(`#task_endDate_${id}`).focus();
        flag = false;
      }
      if (task_revisedStartDate === null || task_revisedStartDate.length === 0) {
        $(document).find(`#task_revisedStartDate_${id}`).css({ 'border': '1px solid red' });
        if (flag)
          $(document).find(`#task_revisedStartDate_${id}`).focus();
        flag = false;
      }
      if (task_revisedManDays === null || task_revisedManDays.length === 0) {
        $(document).find(`#task_revisedManDays_${id}`).css({ 'border': '1px solid red' });
        if (flag)
          $(document).find(`#task_revisedManDays_${id}`).focus();
        flag = false;
      }
      if (task_revisedEndDate === null || task_revisedEndDate.length === 0) {
        $(document).find(`#task_revisedEndDate_${id}`).css({ 'border': '1px solid red' });
        if (flag)
          $(document).find(`#task_revisedEndDate_${id}`).focus();
        flag = false;
      }
      if (task_actualManDays === null || task_actualManDays.length === 0) {
        $(document).find(`#task_actualManDays_${id}`).css({ 'border': '1px solid red' });
        if (flag)
          $(document).find(`#task_actualManDays_${id}`).focus();
        flag = false;
      }
      if (task_allocationPerDay === null || task_allocationPerDay.length === 0) {
        $(document).find(`#task_allocationPerDay_${id}`).css({ 'border': '1px solid red' });
        if (flag)
          $(document).find(`#task_allocationPerDay_${id}`).focus();
        flag = false;
      }
      if (task_clousureDate === null || task_clousureDate.length === 0) {
        $(document).find(`#task_clousureDate_${id}`).css({ 'border': '1px solid red' });
        if (flag)
          $(document).find(`#task_clousureDate_${id}`).focus();
        flag = false;
      }

      // InsertUpdateTask
      if (flag) {
        let insertUpdateTaskObj = {
          taskIdentifier: id,
          projectIdentifier: ProjectIdentifier,
          stage: stageId,
          responsibility: task_responsibility,
          taskDescription: task_taskDescription,
          taskStatus: task_ragStatus,
          btComments: task_btComments,
          pmComments: task_pmComments,
          taskstartDate: task_startDate,
          taskendDate: task_enddate,
          taskestimateDays: Number(task_estManDays),
          taskrevisedManDays: Number(task_revisedManDays),
          taskrevisedStartDate: task_revisedStartDate,
          taskrevisedEndDate: task_revisedEndDate,
          taskActualManDays: Number(task_actualManDays),
          taskAllocationperDay: Number(task_allocationPerDay),
          taskClosureDate: task_clousureDate,
          userIdentifier: CurrentUserIdentifier
        }
        $.ajax({
          url: apiURL + '/Task/InsertUpdateTask',
          type: 'POST',
          contentType: 'application/json',
          async: false,
          data: JSON.stringify(insertUpdateTaskObj),
          success: function (result) {
            console.log(result)
            if (result && result.responseCode === '200') {
              $(`.project_input_${id}`).prop("disabled", true).css('cursor', 'not-allowed');
              $(`.project_input_${id}`).hide();
              $(`.project_label_${id}`).show();
              $(`.fa-calendar${id}`).prop("disabled", false).css('cursor', 'auto');;
              $(`#UpdateRecord_${id}`).hide()
              $(`#Close_${id}`).hide()
              $(`#EditRecord_${id}`).show()
              Do_project_view(ProjectIdentifier);
              $(`[class^='task_calender_${id}']`).hide();
              $(`[class^='task_calender_${id}']`).prop("disabled", true).css('cursor', 'not-allowed');

              var current_style = $(`#card_bdy_${id}`).css('max-height')
              if (current_style === "100px") {
                $(`#card_bdy_${id}`).css({ 'max-height': '133px', 'transition': 'max-height:0.8s' });
              }
              TaskIdentifier = "";
              arrow_id = "";
            }
          },
          error: function (e) {
            //alert('error');
            goToTab1();
          }
        });
      }
      else {
        console.log('values invalid!')
      }
    }



    function DoGetProjectRecordsMethod() {
      $(document).find('.upd_userlog_cmts').css("display", "none");
      console.log(ProjectReqObj);
      ProjectReqObj.batchIdentifier = "";
      $.ajax({
        url: apiURL + '/Project/GetProjects',
        type: 'POST',
        contentType: 'application/json',
        async: false,
        data: JSON.stringify(ProjectReqObj),
        success: function (result) {
          if (result['data'] != null) {
            ProjectsData = result['data'];
            var strhtml = ""
            if (ProjectsData && ProjectsData.length) {
              for (let i = 0; i < ProjectsData.length; i++) {
                strhtml += `<tr class="tbl_row">
                                    <td> <button 
                                        type="button" 
                                        id="Do_project_view-${ProjectsData[i].identifier}"
                                        class="btn btn-success Do_project_view ${styles.btn_create_proj} view_proj_data" >View
                                    </button> </td>
                                    <td>${ProjectsData[i].projectId ? ProjectsData[i].projectId : "N/A"}</td>
                                    <td>${ProjectsData[i].projectName ? ProjectsData[i].projectName : "N/A"}</td>
                                    <td>${ProjectsData[i].tagName ? ProjectsData[i].tagName : "N/A"}</td>
                                    <td>${ProjectsData[i].projectSize ? ProjectsData[i].projectSize : "N/A"}</td>
                                    <td>${ProjectsData[i].deadline ? ProjectsData[i].deadline : "N/A"}</td>
                                    <td style = "text-align:right">${ProjectsData[i].targetGoLive ? ProjectsData[i].targetGoLive : "N/A"}</td>
                                    <td style = "text-align:right">${ProjectsData[i].revisedGoLive ? ProjectsData[i].revisedGoLive : "N/A"}</td>
                                    <td>${ProjectsData[i].sponsers ? ProjectsData[i].sponsers : "N/A"}</td>
                                    <td>${ProjectsData[i].pm ? ProjectsData[i].pm : "N/A"}</td>
                                    <td>${ProjectsData[i].ba ? ProjectsData[i].ba : "N/A"}</td>
                                    <td style = "padding-left : 65px !important">${ProjectsData[i].baPriority ? ProjectsData[i].baPriority : "N/A"}</td>
                                    <td>${ProjectsData[i].dev ? ProjectsData[i].dev : "N/A"}</td>
                                    <td style = "padding-left : 65px !important">${ProjectsData[i].devPriority ? ProjectsData[i].devPriority : "N/A"}</td>
                                    <td>${ProjectsData[i].functionId ? ProjectsData[i].functionId : "N/A"}</td>
                                    <td>${ProjectsData[i].priority ? ProjectsData[i].priority : "N/A"}</td>
                                    <td>${ProjectsData[i].currentStage ? ProjectsData[i].currentStage : "N/A"}</td>
                                    <td>${ProjectsData[i].ragStatus ? `<mark style="background-color: #f0b390;" id='rag_status_project_${ProjectsData[i].identifier}' class="${styles.rag_status}">${ProjectsData[i].ragStatus}</mark>` : "-"}</td>
                                    <td title="${ProjectsData[i].ragComment ? ProjectsData[i].ragComment : "N/A"}">${ProjectsData[i].ragComment ? truncateString(ProjectsData[i].ragComment) : "N/A"}</td>
                                </tr>`
              }
            }
            else {
              strhtml = `<tr>
                            <td style="text-align:center !important;" colspan="19">No Records Found...</td>
                      </tr>`
            }
            $('#project_grid_rec').html(strhtml);
            projectTotalRecords = parseInt(result['recordCount']);
            pagination(projectTotalRecords);
            if (ProjectsData && ProjectsData.length) {
              for (let i = 0; i < ProjectsData.length; i++) {
                if (ProjectsData && ProjectsData[i] && ProjectsData[i].ragStatus && ProjectsData[i].ragStatus === 'Not Started') {
                  $(`#rag_status_project_${ProjectsData[i].identifier}`).css({ 'background-color': "lightblue" })
                }
                else if (ProjectsData && ProjectsData[i] && ProjectsData[i].ragStatus && ProjectsData[i].ragStatus === 'InProgress') {
                  $(`#rag_status_project_${ProjectsData[i].identifier}`).css({ 'background-color': "lightgreen" })
                }
                else if (ProjectsData && ProjectsData[i] && ProjectsData[i].ragStatus && ProjectsData[i].ragStatus === 'Attention') {
                  $(`#rag_status_project_${ProjectsData[i].identifier}`).css({ 'background-color': "lightorange" })
                }
                else if (ProjectsData && ProjectsData[i] && ProjectsData[i].ragStatus && ProjectsData[i].ragStatus === 'At Risk') {
                  $(`#rag_status_project_${ProjectsData[i].identifier}`).css({ 'background-color': "lightred" })
                }
              }
            }
            DoBindDropdownDetails();

          }
        },
        error: function (e) {
          //alert("error")
          var strhtml = `<tr>
                        <td  style="text-align:center" colspan="19">No Records Found...</td>
                      </tr>`
          $('#project_grid_rec').html(strhtml);
          console.log(e)
        }
      });
    }

    $(document).on('change', "#page_filter", function () {
      if (pageFlag == 1) {

        ProjectReqObj.currentPage = 1;
        ProjectReqObj.pageSize = this.value;
        DoGetProjectRecordsMethod()
        pagechanger(0);
        pagination(projectTotalRecords);
      }
      else if (pageFlag == 2) {

        taskstartPage = 1;
        taskTotalPage = this.value;
        DoGetTaskManagementData()
        pagechanger(0);
        pagination(taskTotalRecords);
      }
    });

    function pagination(recordcount) {
      var filterval = $('#projcr_select').val();
      var Glbnoofpages = parseInt($('#page_filter').val().toString());
      var buttoncount = 5;
      var html = "";
      if (recordcount == 0) {
        $('#pagination_container').hide();
      } else {
        $('#pagination_container').show();
      }

      var pagecount = Math.ceil(parseInt(recordcount) / Glbnoofpages);
      var noofpages = pagecount;
      var total = pagecount;
      var startpage = 0;

      if (((Glbnoofpages > 5) || (pagecount > Glbnoofpages)) && (pagecount > buttoncount)) {
        var left = Glbpagenumber - Math.floor(buttoncount / 2);
        var right = Glbpagenumber + Math.floor(buttoncount / 2);
        if (left < 1) {
          left = 1;
          right = buttoncount;
        }
        if (right > pagecount) {
          left = pagecount - (buttoncount - 1);
          right = pagecount;
          if (left < 1) {
            left = 1;
            right = buttoncount;
          }
        }
        startpage = left - 1;
        total = right;
      } else {
        total = pagecount;
        startpage = 0;
      }

      if (Glbpagenumber > 0) {
        html += `<span><button id="first_btn" class="${styles.pagination_bt}" style="margin-right:0px;">First</button></span>`;
        html += `<span><button id="prev_btn" class="${styles.pagination_bt}" style="margin-right:0px;">Prev</button></span>`;
      } else {
        html += `<span><button disabled class="${styles.pagination_bt}" style="margin-right:0px;cursor:not-allowed">First</button></span>`;
        html += `<span><button disabled class="${styles.pagination_bt}" style="margin-right:0px;cursor:not-allowed">Prev</button></span>`;
      }

      for (var i = startpage; i < total; i++) {
        var btnClass = (i === Glbpagenumber) ? `${styles.btn_active_page}` : `${styles.pagination_bt}`;
        html += `<span><button class="btn_page_number ${btnClass}" id="${i}" style="margin-right:0px; border: 1px solid #bcbcbc; padding: 1px 10px;">${i + 1}</button></span>`;
      }

      if (Glbpagenumber != (pagecount - 1)) {
        html += `<span><button class="${styles.pagination_bt}" id="next_btn">Next</button></span>`;
        html += `<span><button class="${styles.pagination_bt}" id="last_btn" style="margin-left:0px;">Last</button></span>`;
      } else {
        html += `<span><button disabled class="${styles.pagination_bt}" style="cursor:not-allowed">Next</button></span>`;
        html += `<span><button disabled class="${styles.pagination_bt}" style="margin-left:0px;cursor:not-allowed">Last</button></span>`;
      }

      $('#pagination_div').html(html);

      $('#current_pagenumber').html("No. of Pages:" + noofpages);
      $('#total_records').html("No. of Records:" + recordcount);

      $('.btn_page_number').on('click', function (e) {
        pagechanger(parseInt(this.id));
      });

      $('#first_btn').on('click', function (e) {
        pagechanger(0);
      });

      $('#prev_btn').on('click', function (e) {
        pagechanger((parseInt(Glbpagenumber.toString()) - 1));
      });

      $('#next_btn').on('click', function (e) {
        pagechanger((parseInt(Glbpagenumber.toString()) + 1));
      });

      $('#last_btn').on('click', function (e) {
        pagechanger((parseInt(pagecount.toString()) - 1));
      });
    }


    function pagechanger(pagenumber) {
      console.log(pagenumber)
      if (pagenumber == Glbpagenumber) return false;
      Glbpagenumber = pagenumber;
      if (pageFlag == 1) {
        ProjectPagination(pagenumber)
      }
      else if (pageFlag == 2) {
        TaskPagination(pagenumber)
      }
    }


    function TaskPagination(pagenumber) {
      pagination(taskTotalRecords);
      taskstartPage = pagenumber + 1;
      taskTotalPage = parseInt($('#page_filter').val().toString())
      DoGetTaskManagementData()
    }
    function ProjectPagination(pagenumber) {
      pagination(projectTotalRecords);
      ProjectReqObj.search = $('#projectSearchTerm').val();
      ProjectReqObj.userIdentifier = CurrentUserIdentifier;
      ProjectReqObj.currentPage = pagenumber + 1;
      ProjectReqObj.pageSize = parseInt($('#page_filter').val().toString())
      DoGetProjectRecordsMethod()
    }

    function DoInsertUpdateProject() {
      $('.project_form_style').css({ 'border': '1px solid gray', 'border-radius': '0px' });
      // $(document).find('.select2-selection--single').css({ 'border': '1px solid gray', 'border-radius': '0px' });
      let flag = true;
      console.log('called')
      let commonProjectidentifier = ProjectIdentifier;
      let project_form_category = 2;//Number($('#project_form_category').val());  // 1-> project ; others -> batch
      let project_form_tagProject = "TAG PROJECT"//$('#project_form_tagProject').val();
      let project_form_commonProjectName = $('#project_form_commonProjectName').val();
      let project_form_batchProjectSize = $('#project_form_batchProjectSize').val();
      let project_form_deadLine = $('#project_form_deadLine').val();
      let project_form_targetGoLive = $('#project_form_targetGoLive').val();
      let project_form_revisedGoLive = $('#project_form_revisedGoLive').val();
      let project_form_sponsers = $('#project_form_sponsers').val();
      let project_form_pm = $('#project_form_pm').val();
      let project_form_ba = $('#project_form_ba').val();
      let project_form_baPriority = $('#project_form_baPriority').val();
      let project_form_dev = $('#project_form_dev').val();
      let project_form_devPriority = $('#project_form_devPriority').val();
      let project_form_tester1 = $('#project_form_tester1').val();
      let project_form_tester2 = $('#project_form_tester2').val();
      let project_form_functionId = $('#project_form_functionId').val();
      let project_form_priority = $('#project_form_priority').val();
      let project_form_currentStage = $('#project_form_currentStage').val();
      let project_form_ragStatus = $('#project_form_ragStatus').val();
      let project_form_ragComment = $('#project_form_ragComment').val();

      // if ($('#project_form_category').val() === null || $('#project_form_category').val() === "") {
      //     $(document).find('#project_form_category').css({ 'border': '1px solid red' });
      //     flag = false;
      // }
      // if (Number($('#project_form_category').val()) === 2 && (project_form_tagProject === null || project_form_tagProject.length === 0)) {
      //     $(document).find('#project_form_tagProject').css({ 'border-color': 'red' });
      //     if(flag)
      //     $(document).find('#project_form_tagProject').focus();
      //     flag = false;
      // }
      if (project_form_commonProjectName === null || project_form_commonProjectName.length === 0) {
        $(document).find('#project_form_commonProjectName').css({ 'border-color': 'red' });
        if (flag)
          $(document).find('#project_form_commonProjectName').focus();
        flag = false;
      }
      if (project_form_batchProjectSize === null || project_form_batchProjectSize.length === 0) {
        $(document).find('#project_form_batchProjectSize').css({ 'border': '1px solid red' });
        if (flag)
          $(document).find('#project_form_batchProjectSize').focus();
        flag = false;
      }
      if (project_form_deadLine === null || project_form_deadLine.length === 0) {
        $(document).find('#project_form_deadLine').css({ 'border': '1px solid red' });
        if (flag)
          $(document).find('#project_form_deadLine').focus();
        flag = false;
      }
      if (project_form_targetGoLive === null || project_form_targetGoLive.length === 0) {
        $(document).find('#project_form_targetGoLive').css({ 'border': '1px solid red' });
        if (flag)
          $(document).find('#project_form_targetGoLive').focus();
        flag = false;
      }
      // if (project_form_revisedGoLive === null || project_form_revisedGoLive.length === 0) {
      //     $(document).find('#project_form_revisedGoLive').css({ 'border': '1px solid red' });
      // if (flag)
      //     $(document).find('#project_form_revisedGoLive').focus();
      //     flag = false;
      // }
      // if (project_form_sponsers === null || project_form_sponsers.length === 0) {
      //     $(document).find('#project_form_sponsers').css({ 'border': '1px solid red' });
      //     flag = false;
      // }
      if (project_form_pm === null || project_form_pm.length === 0 || project_form_pm === "") {
        $(document).find('#project_form_pm + .select2-container').css({ 'border': '1px solid red' });
        if (flag)
          $(document).find('#project_form_pm + .select2-container').focus();
        flag = false;
      }
      if (project_form_ba === null || project_form_ba.length === 0) {
        $(document).find('#project_form_ba + .select2-container').css({ 'border': '1px solid red' });
        if (flag)
          $(document).find('#project_form_ba + .select2-container').focus();
        flag = false;
      }
      if (project_form_baPriority === null || project_form_baPriority.length === 0) {
        $(document).find('#project_form_baPriority').css({ 'border': '1px solid red' });
        if (flag)
          $(document).find('#project_form_baPriority').focus();
        flag = false;
      }
      if (project_form_dev === null || project_form_dev.length === 0) {
        $(document).find('#project_form_dev + .select2-container').css({ 'border': '1px solid red' });
        if (flag)
          $(document).find('#project_form_dev + .select2-container').focus();
        flag = false;
      }
      if (project_form_devPriority === null || project_form_devPriority.length === 0) {
        $(document).find('#project_form_devPriority').css({ 'border': '1px solid red' });
        if (flag)
          $(document).find('#project_form_devPriority').focus();
        flag = false;
      }
      // if (project_form_tester1 === null || project_form_tester1.length === 0) {
      //     $(document).find('#project_form_tester1').css({ 'border': '1px solid red' });
      //     flag = false;
      // }
      // if (project_form_tester2 === null || project_form_tester2.length === 0) {
      //     $(document).find('#project_form_tester2').css({ 'border': '1px solid red' });
      //     flag = false;
      // }
      if (project_form_functionId === null || project_form_functionId.length === 0) {
        $(document).find('#project_form_functionId').css({ 'border': '1px solid red' });
        if (flag)
          $(document).find('#project_form_functionId').focus();
        flag = false;
      }
      if (project_form_priority === null || project_form_priority.length === 0) {
        $(document).find('#project_form_priority').css({ 'border': '1px solid red' });
        if (flag)
          $(document).find('#project_form_priority').focus();
        flag = false;
      }
      if (project_form_currentStage === null || project_form_currentStage.length === 0) {
        $(document).find('#project_form_currentStage').css({ 'border': '1px solid red' });
        if (flag)
          $(document).find('#project_form_currentStage').focus();
        flag = false;
      }
      if (project_form_ragStatus === null || project_form_ragStatus.length === 0) {
        $(document).find('#project_form_ragStatus').css({ 'border': '1px solid red' });
        if (flag)
          $(document).find('#project_form_ragStatus').focus();
        flag = false;
      }
      // if (project_form_ragComment === null || project_form_ragComment.length === 0) {
      //     $(document).find('#project_form_ragComment').css({ 'border': '1px solid red' });
      //     flag = false;
      // }

      if (flag) {
        ProjectInsertObj = {
          ...ProjectInsertObj,
          commonProjectidentifier: commonProjectidentifier,
          category: project_form_category,
          tagProjectIdentifier: project_form_tagProject,
          commonProjectName: project_form_commonProjectName,
          batchProjectSize: project_form_batchProjectSize,
          deadLine: project_form_deadLine,
          targetGoLive: project_form_targetGoLive,
          revisedGoLive: project_form_revisedGoLive,
          sponsers: project_form_sponsers,
          pm: project_form_pm,
          ba: project_form_ba,
          baPriority: project_form_baPriority,
          dev: project_form_dev,
          devPriority: project_form_devPriority,
          tester1: project_form_tester1,
          tester2: project_form_tester2,
          functionId: project_form_functionId,
          priority: project_form_priority,
          currentStage: project_form_currentStage,
          ragStatus: project_form_ragStatus,
          ragComment: project_form_ragComment,

        }
        $.ajax({
          url: apiURL + '/Project/DoInsertUpdateProject',
          type: 'POST',
          contentType: 'application/json',
          async: false,
          data: JSON.stringify(ProjectInsertObj),
          success: function (result) {
            console.log(result);
            if (result['status'] === "Success") {
              console.log('Inserted Successfully');
              clear_project_form();
              goToTab1();
            }
            else {
              //alert('Something went Wrong');
            }
          },
          error: function (e) {
            //alert("error")
            console.log(e)
          }
        });
      }
      else {
        console.log('Values are missing');
      }
    }

    var currentTaskObj = {
      dates: [],
      taskName: ""
    }

    function DoGetDatesForTask(identifier) {

      var reqObj = {
        identifier: identifier,
        userIdentifier: CurrentUserIdentifier
      }

      // DoGetTaskDates
      $.ajax({
        url: apiURL + '/Task/DoGetTaskDates',
        type: 'POST',
        contentType: 'application/json',
        async: false,
        data: JSON.stringify(reqObj),
        success: function (result) {
          console.log(result)
          if (result && result.status === 'Success') {
            currentTaskObj = result.data;
            $('#view_proj').hide();
            // $('#upd_userlog_cmts').hide();
            $('#update_task').show();
            // $('#upd_userlog_cmts').show();
            $('#task_manage').hide();
            DoBindTaskDateRecords();
            $('.DateEdit_Input').hide()
            $('.DateEdit_label').show()
            $('#UpdateTaskName').html(TaskId);
            $('#TaskDatesCount').html(result.recordCount);
          }
        },
        error: function (e) {
          //alert('error');
          goToTab1();
        }
      });
    }

    function DoBindTaskDateRecords() {

      var taskDates = currentTaskObj.dates;
      var dateHtml = `<tr>
                        <td>
                            <button type="button" id="AddDateForTask" class="btn btn-success ${styles.btn_create_proj}">
                            <i class="fa-solid fa-plus" style="margin-right: 8px;"></i>Add</button>
                        </td>
                        <td>
                            <input type="text" disabled placeholder="DD-MM-YYYY" class="addDate form-control  task_date " id="startDate_new_${TaskIdentifier}" style = "font-size:12px !important;">
                        </td>
                        <td>
                            <input type="text" disabled class="addDate form-control  " id="estimatedManDays_new_${TaskIdentifier}" style = "font-size:12px !important;">
                        </td>
                        <td>
                            <input type="text" disabled placeholder="DD-MM-YYYY" class="addDate form-control  task_date " id="endDate_new_${TaskIdentifier}" style=" width: 98% !important;  cursor: not-allowed; font-size:12px !important;">
                        </td>
                        <td>
                            <input type="text" placeholder="DD-MM-YYYY" class="addDate form-control  task_date " id="revisedStartDate_new_${TaskIdentifier}" style=" width: 98% !important; font-size:12px !important;">
                        </td>
                        <td>
                            <input type="text" class="addDate form-control  " id="revisionManDays_new_${TaskIdentifier}" style=" width: 98% !important; font-size:12px !important;">
                        </td>
                        <td>
                            <input type="text" disabled placeholder="DD-MM-YYYY" class="addDate form-control task_date " id="revisedEndDate_new_${TaskIdentifier}" style=" width: 98% !important;  cursor: not-allowed; font-size:12px !important;">
                        </td>
                        <td>
                            <input type="text" class="addDate form-control " id="actualManDays_new_${TaskIdentifier}"  style=" width: 98% !important; font-size:12px !important;">
                        </td>
                        <td>
                            <input type="text" class="addDate form-control" id="allocationPerDay_new_${TaskIdentifier}" style=" width: 98% !important; font-size:12px !important;">
                        </td>
                        <td>
                            <input type="text" placeholder="DD-MM-YYYY" class="addDate form-control task_date " id="closureDate_new_${TaskIdentifier}" style=" width: 98% !important; font-size:12px !important;">
                        </td>
                        <td>
                            <select class="addDate form-select  " id="status_new_${TaskIdentifier}" style=" width: 98% !important; font-size :12px; !important">
                                    <option selected value = "" >Select</>`

      for (let c = 0; c < stslst.length; c++) {
        dateHtml += `<option value = "${stslst[c].configureIdentifier}">${stslst[c].configureName}</>`
      }

      dateHtml += `</select></td>
                        <td>
                            <input type="text" class="addDate form-control " id="comments_new_${TaskIdentifier}" style="width: 98% !important; font-size:12px !important;">
                        </td>
                        </tr>`;

      for (let i = 0; i < taskDates.length; i++) {
        var DateRow = taskDates[i];
        if (i === 0) {
          dateHtml += `<tr> 
                <td>
                    <button type="button" title="Edit" id="EditDate_${DateRow.taskIdentifier}" class="btn btn-success ${styles.btn_create_proj}">
                        <i class="fas fa-pencil-alt" style="margin-right: 6px !important; font-size: 10px !important;"></i> Edit
                    </button>
                    <button type="button" title="Save" id="UpdateDate_${DateRow.taskIdentifier}"  style="display:none" class="btn btn-success p-1 py-0 mx-1 " >
                        <i class="far fa-check-square"></i>
                    </button>
                    <button type="button" title="Cancel" id="CloseDate_${DateRow.taskIdentifier}" style="display:none"  class="btn btn-danger p-1 py-0 mx-1" >
                        <i class="far fa-window-close"></i>
                    </button>
                </td>
                <td style="text-align:right">
                    <input disabled type="text" placeholder="DD-MM-YYYY" value='${DateRow.startDate}' class="DateEdit_Input task_date form-control  " id="startDate_Edit_${DateRow.taskIdentifier}" placeholder="Select Date">
                    <label class="DateEdit_label">${DateRow.startDate ? DateRow.startDate : 'N/A'}</label>
                </td>
                <td style="text-align:right">
                    <input disabled type="text" value='${DateRow.estimatedManDays}' class="numberbox DateEdit_Input  form-control " id="estimatedManDays_Edit_${DateRow.taskIdentifier}">
                    <label class="DateEdit_label">${DateRow.estimatedManDays ? DateRow.estimatedManDays : '0'}</label>
                </td>
                <td style="text-align:right">
                    <input disabled type="text" value='${DateRow.endDate}' placeholder="DD-MM-YYYY" disabled class="DateEdit_Input task_date form-control " id="endDate_Edit_${DateRow.taskIdentifier}" style=" width: 98% !important;  cursor: not-allowed;">
                    <label class="DateEdit_label">${DateRow.endDate ? DateRow.endDate : 'N/A'}</label>
                </td>
                <td style="text-align:right">
                    <input type="text" value='${DateRow.revisedStartDate}' placeholder="DD-MM-YYYY" class="DateEdit_Input task_date form-control " id="revisedStartDate_Edit_${DateRow.taskIdentifier}" style=" width: 98% !important;">
                    <label class="DateEdit_label">${DateRow.revisedStartDate ? DateRow.revisedStartDate : 'N/A'}</label>
                </td>
                <td style="text-align:right">
                    <input type="text" value='${DateRow.revisionManDays}' class="numberbox DateEdit_Input  form-control " id="revisionManDays_Edit_${DateRow.taskIdentifier}" style=" width: 98% !important;">
                    <label class="DateEdit_label">${DateRow.revisionManDays ? DateRow.revisionManDays : '0'}</label>
                </td>
                <td style="text-align:right">
                    <input type="text" value='${DateRow.revisedEndDate}' placeholder="DD-MM-YYYY" disabled class="DateEdit_Input task_date form-control " id="revisedEndDate_Edit_${DateRow.taskIdentifier}" style=" width: 98% !important;  cursor: not-allowed;">
                    <label class="DateEdit_label">${DateRow.revisedEndDate ? DateRow.revisedEndDate : 'N/A'}</label>
                </td>
                <td style="text-align:right">
                    <input type="text" value='${DateRow.actualManDays}' class="DateEdit_Input numberbox  form-control" id="actualManDays_Edit_${DateRow.taskIdentifier}" style=" width: 98% !important;">
                    <label class="DateEdit_label">${DateRow.actualManDays ? DateRow.actualManDays : '0'}</label>
                </td>
                <td style="text-align:right">
                    <input type="text" value='${DateRow.allocationPerDay}' class="DateEdit_Input numberbox  form-control " id="allocationPerDay_Edit_${DateRow.taskIdentifier}" style="width: 98% !important;">
                    <label class="DateEdit_label">${DateRow.allocationPerDay ? DateRow.allocationPerDay : '0'}</label>
                </td>
                <td style="text-align:right">
                    <input type="text" value='${DateRow.closureDate}' placeholder="DD-MM-YYYY" class="DateEdit_Input task_date form-control " id="closureDate_Edit_${DateRow.taskIdentifier}" style=" width: 98% !important;">
                    <label class="DateEdit_label">${DateRow.closureDate ? DateRow.closureDate : 'N/A'}</label>
                </td>
                <td style="text-align:left">
                        <select class="DateEdit_Input  form-select " id="status_Edit_${DateRow.taskIdentifier}" value='${DateRow.statusText}' id="status_new" style=" width: 98% !important; font-size:12px; ">
                                <option selected value = "" >Select</>`

          for (let c = 0; c < stslst.length; c++) {
            dateHtml += `<option value = "${stslst[c].configureIdentifier}">${stslst[c].configureName}</>`
          }

          dateHtml += `</select>
                    <label class="DateEdit_label">${DateRow.statusText ? DateRow.statusText : 'N/A'}</label>
                </td>
                <td style="text-align:left">
                    <input type="text" value='${DateRow.comments}' class="DateEdit_Input form-control }  " id="comments_Edit_${DateRow.taskIdentifier}" style=" width: 98% !important;">
                    <label class="DateEdit_label" title="${DateRow.comments ? DateRow.comments : 'N/A'}">${DateRow.comments ? truncateString(DateRow.comments) : 'N/A'}</label>
                </td>
            </tr>`;
        }
        else {
          dateHtml += `<tr>
                <td style ="text-align:center;" > - </td>
                <td style ="text-align:right;" >
                    <label>${DateRow.startDate ? DateRow.startDate : 'N/A'}</label>
                </td>
                <td style ="text-align:right;" >
                    <label>${DateRow.estimatedManDays ? DateRow.estimatedManDays : '0'}</label>
                </td>
                <td style ="text-align:right;" >
                    <label>${DateRow.endDate ? DateRow.endDate : 'N/A'}</label>
                </td>
                <td style ="text-align:right;" >
                    <label>${DateRow.revisedStartDate ? DateRow.revisedStartDate : 'N/A'}</label>
                </td>
                <td style ="text-align:right;" >
                    <label>${DateRow.revisionManDays ? DateRow.revisionManDays : '0'}</label>
                </td>
                <td style ="text-align:right;" >
                    <label>${DateRow.revisedEndDate ? DateRow.revisedEndDate : 'N/A'}</label>
                </td>
                <td style ="text-align:right;" >
                    <label>${DateRow.actualManDays ? DateRow.actualManDays : '0'}</label>
                </td>
                <td style ="text-align:right;" >
                    <label>${DateRow.allocationPerDay ? DateRow.allocationPerDay : '0'}</label>
                </td>
                <td style ="text-align:right;" >
                    <label>${DateRow.closureDate ? DateRow.closureDate : 'N/A'}</label>
                </td>
                <td style ="text-align:left;" >
                    <label>${DateRow.statusText ? DateRow.statusText : 'N/A'}</label>
                </td>
                <td style ="text-align:left;" >
                    <label title="${DateRow.comments ? DateRow.comments : 'N/A'}">${DateRow.comments ? truncateString(DateRow.comments) : 'N/A'}</label>
                </td>
            </tr>`;
        }
      }
      $('#tbl_task_dates').html(dateHtml);

      for (let i = 0; i < taskDates.length; i++) {
        var DateRow = taskDates[i];
        if (i == 0) {
          $(`#startDate_new_` + TaskIdentifier).val(DateRow.startDate).trigger('change');
          $(`#estimatedManDays_new_` + TaskIdentifier).val(DateRow.estimatedManDays).trigger('change');
        }
        else
          break;
      }
      $('.DateEdit_Input').css('font-size', '12px')
      $('.addDate').css({ 'border': '1px solid gray', 'border-radius': '0px' });
      $('.DateEdit_Input').css({ 'border': '1px solid gray', 'border-radius': '0px' });
      date_picker();
    }

    $(document).on('keypress', '.numberbox', function validateInput(event) {
      var key = event.key;
      // Allow only numbers (0-9) and backspace
      if (!/[\d]/.test(key) && key !== 'Backspace') {
        event.preventDefault();
      }

      // Prevent typing 'e'
      if (key === 'e' || key === 'E') {
        event.preventDefault();
      }
    })

    $(document).on('keypress', '.numberbox-pri', function (event) {
      var key = event.key;
      var inputValue = $(this).val() + key;

      // Allow only numbers between 1 and 6 and backspace
      if (!/^([1-6])$/.test(inputValue) && key !== 'Backspace') {
        event.preventDefault();
      }

      // Prevent typing 'e'
      if (key === 'e' || key === 'E') {
        event.preventDefault();
      }
    });

    $(document).on("click", "[id^='EditDate_']", function () {
      console.log(this.id)
      var temp_id = this.id;
      var splitArray = temp_id.split('_');
      var id = splitArray[splitArray.length - 1];
      TaskIdentifier = id;

      var taskDates = currentTaskObj.dates;
      for (let i = 0; i < taskDates.length; i++) {
        var DateRow = taskDates[i];
        if (i === 0) {
          $(`#status_Edit_${id}`).val(DateRow.status)
        }
        else {
          break;
        }
      }

      $('.DateEdit_Input').show()
      $('.DateEdit_label').hide()
      $(`#EditDate_${id}`).hide()
      $(`#UpdateDate_${id}`).show()
      $(`#CloseDate_${id}`).show()
      date_picker();
    })

    $(document).on("click", "[id^='UpdateDate_']", function () {

      var button = $(this);
      var text = button.html();
      button.html('<div class="spinner-border spinner-border-sm" role="status"><span class="visually-hidden">Loading...</span></div>');
      setTimeout(async () => {
        var temp_id = this.id;
        var splitArray = temp_id.split('_');
        var id = splitArray[splitArray.length - 1];
        TaskIdentifier = id;

        $('.addDate').css({ 'border': '1px solid gray', 'border-radius': '0px' });
        $('.DateEdit_Input').css({ 'border': '1px solid gray', 'border-radius': '0px' });
        DoUpdateTaskDates(id, 2);

        button.html(text);
      }, 500);
    })

    $(document).on("click", "[id^='CloseDate_']", function () {
      var temp_id = this.id;
      var splitArray = temp_id.split('_');
      var id = splitArray[splitArray.length - 1];
      TaskIdentifier = id;

      DoBindTaskDateRecords();
      $('.DateEdit_Input').hide()
      $('.DateEdit_label').show()
      $(`#EditDate_${id}`).show()
      $(`#UpdateDate_${id}`).hide()
      $(`#CloseDate_${id}`).hide()
    })

    $(document).on("click", "#AddDateForTask", function () {
      var button = $(this);
      var text = button.html()
      button.html(`<div class="spinner-border spinner-border-sm" role="status"><span class="visually-hidden">Loading...</span></div> Add`);

      setTimeout(async () => {
        await DoUpdateTaskDates(TaskIdentifier, 1);
        button.html(text);
      }, 1000);
    })

    $(document).on("change", "[id^='startDate_new_']", function () {
      var temp_id = this.id;
      var splitArray = temp_id.split('_');
      var id = splitArray[splitArray.length - 1];
      TaskIdentifier = id;
      CalculateEndDate(id, 'startDate_new_', 'estimatedManDays_new_', 'endDate_new_')
    });

    $(document).on("change", "[id^='estimatedManDays_new_']", function () {
      var temp_id = this.id;
      var splitArray = temp_id.split('_');
      var id = splitArray[splitArray.length - 1];
      TaskIdentifier = id;
      CalculateEndDate(id, 'startDate_new_', 'estimatedManDays_new_', 'endDate_new_')
    });

    $(document).on("change", "[id^='revisedStartDate_new_']", function () {
      var temp_id = this.id;
      var splitArray = temp_id.split('_');
      var id = splitArray[splitArray.length - 1];
      TaskIdentifier = id;
      CalculateEndDate(id, 'revisedStartDate_new_', 'revisionManDays_new_', 'revisedEndDate_new_')
    });

    $(document).on("change", "[id^='revisionManDays_new_']", function () {
      var temp_id = this.id;
      var splitArray = temp_id.split('_');
      var id = splitArray[splitArray.length - 1];
      TaskIdentifier = id;
      CalculateEndDate(id, 'revisedStartDate_new_', 'revisionManDays_new_', 'revisedEndDate_new_')
    });

    $(document).on("change", "[id^='startDate_Edit_']", function () {
      var temp_id = this.id;
      var splitArray = temp_id.split('_');
      var id = splitArray[splitArray.length - 1];
      TaskIdentifier = id;
      CalculateEndDate(id, 'startDate_Edit_', 'estimatedManDays_Edit_', 'endDate_Edit_')
    });

    $(document).on("change", "[id^='estimatedManDays_Edit_']", function () {
      var temp_id = this.id;
      var splitArray = temp_id.split('_');
      var id = splitArray[splitArray.length - 1];
      TaskIdentifier = id;
      CalculateEndDate(id, 'startDate_Edit_', 'estimatedManDays_Edit_', 'endDate_Edit_')
    });

    $(document).on("change", "[id^='revisedStartDate_Edit_']", function () {
      var temp_id = this.id;
      var splitArray = temp_id.split('_');
      var id = splitArray[splitArray.length - 1];
      TaskIdentifier = id;
      CalculateEndDate(id, 'revisedStartDate_Edit_', 'revisionManDays_Edit_', 'revisedEndDate_Edit_')
    });

    $(document).on("change", "[id^='revisionManDays_Edit_']", function () {
      var temp_id = this.id;
      var splitArray = temp_id.split('_');
      var id = splitArray[splitArray.length - 1];
      TaskIdentifier = id;
      CalculateEndDate(id, 'revisedStartDate_Edit_', 'revisionManDays_Edit_', 'revisedEndDate_Edit_')
    });

    function DoUpdateTaskDates(id, type) {
      let flag = true;
      console.log(id);
      let startDate_Edit;
      let estimatedManDays_Edit;
      let endDate_Edit;
      let revisedStartDate_Edit;
      let revisionManDays_Edit;
      let revisedEndDate_Edit;
      let actualManDays_Edit;
      let allocationPerDay_Edit;
      let closureDate_Edit;
      let status_Edit;
      let comments_Edit;


      $('.addDate').css({ 'border': '1px solid gray', 'border-radius': '0px' });
      $('.DateEdit_Input').css({ 'border': '1px solid gray', 'border-radius': '0px' });

      if (type === 1) {// new
        console.log('new')
        startDate_Edit = $(`#startDate_new_${id}`).val();
        estimatedManDays_Edit = $(`#estimatedManDays_new_${id}`).val();
        endDate_Edit = $(`#endDate_new_${id}`).val();
        revisedStartDate_Edit = $(`#revisedStartDate_new_${id}`).val();
        revisionManDays_Edit = $(`#revisionManDays_new_${id}`).val();
        revisedEndDate_Edit = $(`#revisedEndDate_new_${id}`).val();
        actualManDays_Edit = $(`#actualManDays_new_${id}`).val();
        allocationPerDay_Edit = $(`#allocationPerDay_new_${id}`).val();
        closureDate_Edit = $(`#closureDate_new_${id}`).val();
        status_Edit = $(`#status_new_${id}`).val();
        comments_Edit = $(`#comments_new_${id}`).val();

        if (!startDate_Edit || startDate_Edit.length === 0) {
          $(document).find(`#startDate_new_${id}`).css({ 'border': '1px solid red' });
          $(document).find(`#startDate_new_${id}`).focus();
          flag = false;
        }
        if (!estimatedManDays_Edit || Number(estimatedManDays_Edit) === undefined) {
          $(document).find(`#estimatedManDays_new_${id}`).css({ 'border': '1px solid red' });
          if (flag)
            $(document).find(`#estimatedManDays_new_${id}`).focus();
          flag = false;
        }
        // if (!endDate_Edit || endDate_Edit.length === 0) {
        //     $(document).find(`#endDate_new_${id}`).css({ 'border': '1px solid red' });
        //     flag = false;
        // }
        if (!revisedStartDate_Edit || revisedStartDate_Edit.length === 0) {
          $(document).find(`#revisedStartDate_new_${id}`).css({ 'border': '1px solid red' });
          if (flag)
            $(document).find(`#revisedStartDate_new_${id}`).focus();
          flag = false;
        }
        if (!revisionManDays_Edit || Number(revisionManDays_Edit) === undefined) {
          $(document).find(`#revisionManDays_new_${id}`).css({ 'border': '1px solid red' });
          if (flag)
            $(document).find(`#revisionManDays_new_${id}`).focus();
          flag = false;
        }
        // if (!revisedEndDate_Edit || revisedEndDate_Edit.length === 0) {
        //     $(document).find(`#revisedEndDate_new_${id}`).css({ 'border': '1px solid red' });
        //     flag = false;
        // }
        if (!actualManDays_Edit || Number(actualManDays_Edit) === undefined) {
          $(document).find(`#actualManDays_new_${id}`).css({ 'border': '1px solid red' });
          if (flag)
            $(document).find(`#actualManDays_new_${id}`).focus();
          flag = false;
        }
        if (!allocationPerDay_Edit || Number(allocationPerDay_Edit) === undefined) {
          $(document).find(`#allocationPerDay_new_${id}`).css({ 'border': '1px solid red' });
          if (flag)
            $(document).find(`#allocationPerDay_new_${id}`).focus();
          flag = false;
        }
        if (!closureDate_Edit || closureDate_Edit.length === 0) {
          $(document).find(`#closureDate_new_${id}`).css({ 'border': '1px solid red' });
          if (flag)
            $(document).find(`#closureDate_new_${id}`).focus();
          flag = false;
        }
        if (!status_Edit || status_Edit.length === 0) {
          $(document).find(`#status_new_${id}`).css({ 'border': '1px solid red' });
          if (flag)
            $(document).find(`#status_new_${id}`).focus();
          flag = false;
        }
        // if (!comments_Edit || comments_Edit.length === 0) {
        //     $(document).find(`#comments_new_${id}`).css({ 'border': '1px solid red' });
        //     flag = false;
        // }

      }
      else {

        console.log('edit')
        startDate_Edit = $(`#startDate_Edit_${id}`).val();
        estimatedManDays_Edit = $(`#estimatedManDays_Edit_${id}`).val();
        endDate_Edit = $(`#endDate_Edit_${id}`).val();
        revisedStartDate_Edit = $(`#revisedStartDate_Edit_${id}`).val();
        revisionManDays_Edit = $(`#revisionManDays_Edit_${id}`).val();
        revisedEndDate_Edit = $(`#revisedEndDate_Edit_${id}`).val();
        actualManDays_Edit = $(`#actualManDays_Edit_${id}`).val();
        allocationPerDay_Edit = $(`#allocationPerDay_Edit_${id}`).val();
        closureDate_Edit = $(`#closureDate_Edit_${id}`).val();
        status_Edit = $(`#status_Edit_${id}`).val();
        comments_Edit = $(`#comments_Edit_${id}`).val();

        if (!startDate_Edit || startDate_Edit.length === 0) {
          $(`#startDate_Edit_${id}`).css('border', '1px solid red');
          $(`#startDate_Edit_${id}`).focus();
          flag = false;
        }
        if (!estimatedManDays_Edit || Number(estimatedManDays_Edit) === undefined) {
          $(`#estimatedManDays_Edit_${id}`).css('border', '1px solid red');
          $(`#estimatedManDays_Edit_${id}`).focus();
          flag = false;
        }
        // if (!endDate_Edit || endDate_Edit.length === 0) {
        //     $(`#endDate_Edit_${id}`).css('border', '1px solid red');
        //     flag = false;
        // }
        if (!revisedStartDate_Edit || revisedStartDate_Edit.length === 0) {
          $(`#revisedStartDate_Edit_${id}`).css('border', '1px solid red');
          $(`#revisedStartDate_Edit_${id}`).focus();
          flag = false;
        }
        if (!revisionManDays_Edit || Number(revisionManDays_Edit) === undefined) {
          $(`#revisionManDays_Edit_${id}`).css('border', '1px solid red');
          $(`#revisionManDays_Edit_${id}`).focus();
          flag = false;
        }
        // if (!revisedEndDate_Edit || revisedEndDate_Edit.length === 0) {
        //     $(`#revisedEndDate_Edit_${id}`).css('border', '1px solid red');
        //     flag = false;
        // }
        if (!actualManDays_Edit || Number(actualManDays_Edit) === undefined) {
          $(`#actualManDays_Edit_${id}`).css('border', '1px solid red');
          $(`#actualManDays_Edit_${id}`).focus();
          flag = false;
        }
        if (!allocationPerDay_Edit || Number(allocationPerDay_Edit) === undefined) {
          $(`#allocationPerDay_Edit_${id}`).css('border', '1px solid red');
          $(`#allocationPerDay_Edit_${id}`).focus();
          flag = false;
        }
        if (!closureDate_Edit || closureDate_Edit.length === 0) {
          $(`#closureDate_Edit_${id}`).css('border', '1px solid red');
          $(`#closureDate_Edit_${id}`).focus();
          flag = false;
        }
        if (!status_Edit || status_Edit.length === 0) {
          $(`#status_Edit_${id}`).css('border', '1px solid red');
          $(`#status_Edit_${id}`).focus();
          flag = false;
        }
        // if (!comments_Edit || comments_Edit.length === 0) {
        //     $(`#comments_Edit_${id}`).css('border', '1px solid red');
        //     flag = false;
        // }
      }
      $(document).find(`#actualManDays_new`).css("border", "1px solid red");


      console.log(flag)
      // InsertUpdateTask
      if (flag) {
        let DateInsertObj = {
          "projectIdentifier": ProjectIdentifier,
          "stageIdentifier": "",
          "taskIdentifier": id,
          "logType": 0,
          "startDate": startDate_Edit,
          "estimatedManDays": Number(estimatedManDays_Edit),
          "endDate": endDate_Edit,
          "revisedStartDate": revisedStartDate_Edit,
          "revisionManDays": Number(revisionManDays_Edit),
          "revisedEndDate": revisedEndDate_Edit,
          "actualManDays": Number(actualManDays_Edit),
          "allocationPerDay": Number(allocationPerDay_Edit),
          "status": status_Edit,
          "statusText": "",
          "closureDate": closureDate_Edit,
          "comments": comments_Edit,
          "userIdentifier": CurrentUserIdentifier
        };
        $.ajax({
          url: apiURL + '/Task/DoInsertUpdateTaskDate',
          type: 'POST',
          contentType: 'application/json',
          async: false,
          data: JSON.stringify(DateInsertObj),
          success: function (result) {
            console.log(result);
            if (result && result.responseCode === "200") {
              DoGetDatesForTask(id);
              $('.DateEdit_Input').hide();
              $('.DateEdit_label').show();
              $(`#EditDate_${id}`).show();
              $(`#UpdateDate_${id}`).hide();
              $(`#CloseDate_${id}`).hide();
              Do_Get_Project_Logs();
            }
          },
          error: function (e) {
            //alert('error');
            goToTab1();
          }
        });
      } else {
        console.log('values invalid!');
      }
    }


    function DoBindDropdownDetails() {
      $.ajax({
        url: apiURL + '/Configuration/AllConfigurationData',
        method: "GET",
        contentType: 'application/json',
        async: false,
        data: {},
        success: function (data: any) {
          console.log(data);
          if (data != null) {
            console.log(data);
            balst = data.balst;
            cntrylst = data.cntrylst;
            devlst = data.devlst;
            fnctlst = data.fnctlst;
            functionMasterLst = data.functionMasterLst;
            keylst = data.keylst;
            pmlst = data.pmlst;
            prjlst = data.prjlst;
            raglst = data.raglst;
            resplst = data.resplst;
            stglst = data.stglst;
            stslst = data.stslst;
            testlst = data.testlst;
            prtylst = data.prtylst;
            var emp = data.emplst;

            var htmlcode = '';
            htmlcode = `<option value ="" selected>Select</option>`;
            if (emp && emp.length > 0) {
              for (var i = 0; i < emp.length; i++) {
                htmlcode += `<option value = ${emp[i].configureIdentifier}>${emp[i].configureName}</option>`;
              }
            }
            $('#task_responsibility').html(htmlcode);

            htmlcode = `<option value ="" selected>Select</option>`;
            if (raglst && raglst.length > 0) {
              for (var i = 0; i < raglst.length; i++) {
                htmlcode += `<option value = ${raglst[i].configureIdentifier}>${raglst[i].configureName}</option>`
              }
            }
            $('#project_form_ragStatus').html(htmlcode);

            htmlcode = `<option value ="" selected>Select</option>`;
            if (balst && balst.length > 0) {
              for (var i = 0; i < balst.length; i++) {
                htmlcode += `<option value = ${balst[i].configureIdentifier}>${balst[i].configureName}</option>`;
              }
            }
            $('#project_form_ba').html(htmlcode);

            htmlcode = `<option value ="" selected>Select</option>`;
            if (cntrylst && cntrylst.length > 0) {
              for (var i = 0; cntrylst.length; i++) {
                htmlcode += `<option value = ${cntrylst[i].configureIdentifier}>${cntrylst[i].configureName}</option>`;
              }
            }
            // $('').html(htmlcode);  country

            htmlcode = `<option value ="" selected>Select</option>`;
            if (devlst && devlst.length > 0) {

              for (var i = 0; i < devlst.length; i++) {
                htmlcode += `<option value = ${devlst[i].configureIdentifier}>${devlst[i].configureName}</option>`;
              }
            }
            $('#project_form_dev').html(htmlcode);

            htmlcode = `<option value ="" selected>Select</option>`;
            if (functionMasterLst && functionMasterLst.length > 0) {
              for (var i = 0; i < functionMasterLst.length; i++) {
                htmlcode += `<option value = ${functionMasterLst[i].configureIdentifier}>${functionMasterLst[i].configureName}</option>`
              }
            }
            $('#project_form_functionId').html(htmlcode);

            htmlcode = `<option value ="" selected>Select</option>`;
            if (keylst && keylst.length > 0) {
              for (var i = 0; i < keylst.length; i++) {
                htmlcode += `<option value = ${keylst[i].configureIdentifier}>${keylst[i].configureName}</option>`;
              }
            }
            $('#task_keysteps').html(htmlcode);

            htmlcode = `<option value ="" selected>Select</option>`;
            if (pmlst && pmlst.length > 0) {
              for (var i = 0; i < pmlst.length; i++) {
                htmlcode += `<option value = ${pmlst[i].configureIdentifier}>${pmlst[i].configureName}</option>`;
              }
            }
            $('#project_form_pm').html(htmlcode);

            htmlcode = `<option value ="" selected>Select</option>`;
            if (stglst && stglst.length > 0) {
              for (var i = 0; i < stglst.length; i++) {
                htmlcode += `<option value = ${stglst[i].configureIdentifier}>${stglst[i].configureName}</option>`;
              }
            }
            $('#project_form_currentStage').html(htmlcode);
            $('#task_stage').html(htmlcode);

            htmlcode = `<option value ="" selected>Select</option>`;
            if (prjlst && prjlst.length > 0) {
              for (var i = 0; i < prjlst.length; i++) {
                htmlcode += `<option value = ${prjlst[i].configureIdentifier}>${prjlst[i].configureName}</option>`;
              }
            }
            $('#project_form_batchProjectSize').html(htmlcode);

            htmlcode = `<option value ="" selected>Select</option>`;
            if (resplst && resplst.length > 0) {
              for (var i = 0; i < resplst.length; i++) {
                htmlcode += `<option value = ${resplst[i].configureIdentifier}>${resplst[i].configureName}</option>`;
              }
            }
            $('#task_resp').html(htmlcode);

            htmlcode = `<option value ="" selected>Select</option>`;
            if (stglst && stglst.length > 0) {
              for (var i = 0; i < stglst.length; i++) {
                htmlcode += `<option value = ${stglst[i].configureIdentifier}>${stglst[i].configureName}</option>`;
              }
            }
            $('#project_form_currentStage').html(htmlcode);

            htmlcode = `<option value ="" selected>Select</option>`;
            if (stslst && stslst.length > 0) {
              for (var i = 0; i < stslst.length; i++) {
                htmlcode += `<option value = ${stslst[i].configureIdentifier}>${stslst[i].configureName}</option>`;
              }
            }
            $('#task_status').html(htmlcode);

            htmlcode = `<option value = "" selected>Select</option>`;
            if (testlst && testlst.length > 0) {
              for (var i = 0; i < testlst.length; i++) {
                htmlcode += `<option value = ${testlst[i].configureIdentifier}>${testlst[i].configureName}</option>`;
              }
            }
            $('#project_form_tester2').html(htmlcode);
            $('#project_form_tester1').html(htmlcode);

            htmlcode = `<option value ="" selected>Select</option>`;
            if (prtylst && prtylst.length > 0) {
              for (var i = 0; i < prtylst.length; i++) {
                htmlcode += `<option value = ${prtylst[i].configureIdentifier}>${prtylst[i].configureName}</option>`;
              }
            }
            $('#project_form_priority').html(htmlcode);
          }
        },
        error: function (e: any) {
          console.log(e);
        }
      })
    }

    $('#DoSubmit').on('click', function () {
      var button = $(this);
      button.html('<div class="spinner-border spinner-border-sm" role="status"><span class="visually-hidden">Loading...</span></div> Saving');
      setTimeout(async () => {
        await DoSubmit();
        button.html('Save');
      }, 500);
    })

    $('#DoCancel').on('click', function () {
      var button = $(this);
      button.html('<div class="spinner-border spinner-border-sm" role="status"><span class="visually-hidden">Loading...</span></div> Cancelling');
      setTimeout(async () => {
        await DoCancel();
        button.html('Cancel');
      }, 500);
    })

    function DoSubmit() {
      if (FormNo === 1) {
        DoInsertUpdateProject();
      }
      else if (FormNo === 2) {
        DoInsertTaskDetails();

      }
      else {
        console.log('Goman Asai');
      }
    }

    function DoCancel() {
      if (FormNo === 1) { // create form
        goToTab1();
      }
      else if (FormNo === 2) {
        if (UpdateTask == 0) {
          doReturnToProjectView();
        }
        else if (UpdateTask == 1) {
          $('#upd_userlog_cmts').hide();
          $('#task_manage').show();
          $('#pagination_container').show();
          $('#task_content').hide();
          $('#buttons').hide();
        }

      }
      else {

      }
    }

    $('#task_stage').on('change', function () {
      var task_stage = $('#task_stage').val();
      var data = { configureIdentifier: task_stage, configureId: 1 };
      $.ajax({
        url: apiURL + '/Configuration/GetParticularConfigurationData',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function (data) {
          console.log(data);
          var keysteps = data.details;
          var htmlcode = `<option value ="" selected>Select</option>`;
          if (keysteps.length > 0) {
            console.log(keysteps);
            for (var i = 0; i < keysteps.length; i++) {
              htmlcode += `<option value = ${keysteps[i].configureIdentifier}>${keysteps[i].configureName}</option>`;
            }
          }
          $('#task_keysteps').html(htmlcode);
          $('#task_resp').val("");
          $('#task_responsibility').val("");
          $('#task_descrip').val("").prop('disabled', false);
        },
        error: function (e) {
          console.log(e);
        }
      })
    })
    $('#task_keysteps').on('change', function () {
      var task_steps = $('#task_keysteps').val();
      var data = { configureIdentifier: task_steps, configureId: 2 };
      $.ajax({
        url: apiURL + '/Configuration/GetParticularConfigurationData',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function (data) {
          console.log(data);
          var resplst = data.details;
          var htmlcode = `<option value ="" selected>Select</option>`;
          if (resplst.length > 0) {
            for (var i = 0; i < resplst.length; i++) {
              htmlcode += `<option value = ${resplst[i].configureIdentifier}>${resplst[i].configureName}</option>`

            }
          }
          $('#task_resp').html(htmlcode);
          $('#task_responsibility').val("");
          $('#task_descrip').val(resplst[0].taskDescription).prop('disabled', true);

        },
        error: function (e) {
          console.log(e);
        }
      })
    })

    var isProgrammaticChange = false;

    $('#task_resp').on('change', function () {
      if (!isProgrammaticChange) {
        var task_resp = $('#task_resp').val();
        var data = { configureIdentifier: task_resp, configureId: 3 };
        $.ajax({
          url: apiURL + '/Configuration/GetParticularConfigurationData',
          method: 'POST',
          contentType: 'application/json',
          data: JSON.stringify(data),
          success: function (data) {
            console.log(data);
            var responlst = data.details;
            var htmlcode = '';
            htmlcode = `<option value =""selected>Select</option>`;
            if (responlst.length > 0) {
              for (var i = 0; i < responlst.length; i++) {
                htmlcode += `<option value = ${responlst[i].configureIdentifier}>${responlst[i].configureName}</option>`
              }
            }
            $('#task_responsibility').html(htmlcode);
          },
          error: function (e) {
            console.log(e);
          }
        })
      }
    })

    $('#task_startdate_new').on("change", function () {
      var temp_id = this.id;
      var splitArray = temp_id.split('_');
      var id = splitArray[splitArray.length - 1];
      TaskIdentifier = id;
      $('#task_revisedstartdate_new').val(this.value).trigger('change');
      CalculateEndDate(id, 'task_startdate_', 'task_estmandays_', 'task_enddate_')
    });

    $('#task_estmandays_new').on("change", function () {
      var temp_id = this.id;
      var splitArray = temp_id.split('_');
      var id = splitArray[splitArray.length - 1];
      TaskIdentifier = id;
      $('#task_revisemandays_new').val(this.value).trigger('change');
      CalculateEndDate(id, 'task_startdate_', 'task_estmandays_', 'task_enddate_')
    });

    $('#task_revisedstartdate_new').on("change", function () {
      var temp_id = this.id;
      var splitArray = temp_id.split('_');
      var id = splitArray[splitArray.length - 1];
      TaskIdentifier = id;
      CalculateEndDate(id, 'task_revisedstartdate_', 'task_revisemandays_', 'task_revisedenddate_')
    });

    $('#task_revisemandays_new').on("change", function () {
      var temp_id = this.id;
      var splitArray = temp_id.split('_');
      var id = splitArray[splitArray.length - 1];
      TaskIdentifier = id;
      CalculateEndDate(id, 'task_revisedstartdate_', 'task_revisemandays_', 'task_revisedenddate_')
    });

    function clear_Task_Validation() {
      $(document).find('#task_taskid').css({ 'border': '1px solid #c5c5c5' });
      $(document).find('#task_dependentid').css({ 'border': '1px solid #c5c5c5' });
      $(document).find('#task_stage').css({ 'border': '1px solid #c5c5c5' });
      $(document).find('#task_keysteps').css({ 'border': '1px solid #c5c5c5' });
      $(document).find('#task_resp +.select2-container').css({ 'border': '1px solid #c5c5c5' });
      $(document).find('#task_responsibility + .select2-container').css({ 'border': '1px solid #c5c5c5' });
      $(document).find('#task_descrip').css({ 'border': '1px solid #c5c5c5' });
      $(document).find('#task_status').css({ 'border': '1px solid #c5c5c5' });
      $(document).find('#task_startdate_new').css({ 'border': '1px solid #c5c5c5' });
      $(document).find('#task_estmandays_new').css({ 'border': '1px solid #c5c5c5' });
      $(document).find('#task_enddate_new').css({ 'border': '1px solid #c5c5c5' });
      $(document).find('#task_revisedstartdate_new').css({ 'border': '1px solid #c5c5c5' });
      $(document).find('#task_revisemandays_new').css({ 'border': '1px solid #c5c5c5' });
      $(document).find('#task_revisedenddate_new').css({ 'border': '1px solid #c5c5c5' });
      $(document).find('#task_acutalmandays').css({ 'border': '1px solid #c5c5c5' });
      $(document).find('#task_allocationperday').css({ 'border': '1px solid #c5c5c5' });
      $(document).find('#task_closuredate').css({ 'border': '1px solid #c5c5c5' });
      $(document).find('#task_commentsbt').css({ 'border': '1px solid #c5c5c5' });
      $(document).find('#task_commentspm').css({ 'border': '1px solid #c5c5c5' });
    }

    function DoInsertTaskDetails() {
      clear_Task_Validation();
      // //alert(TaskIdentifier);
      console.log(ProjectIdentifier);
      var flag = true;
      var tsk_stg = $('#task_stage').val();
      var key_step = $('#task_keysteps').val();
      var tsk_resp = $('#task_resp').val();
      var tsk_response = $('#task_responsibility').val();
      var tsk_description = $('#task_descrip').val();
      var tsk_sts = $('#task_status').val();
      var tsk_btcomment = $('#task_commentsbt').val();
      var tsk_pmcomment = $('#task_commentspm').val();
      var tsk_strdate = $('#task_startdate_new').val();
      var tsk_est_mandays = $('#task_estmandays_new').val();
      var tsk_enddate = $('#task_enddate_new').val();
      var tsk_revisestartdate = $('#task_revisedstartdate_new').val();
      var tsk_revisemanddays = $('#task_revisemandays_new').val();
      var tsk_reviseenddate = $('#task_revisedenddate_new').val();
      var tsk_actualmanday = $('#task_acutalmandays').val();
      var tsk_allocationday = $('#task_allocationperday').val();
      var tsk_closuredate = $('#task_closuredate').val();

      if (UpdateTask == 0) {
        taskIdentifier = "";
      }

      if (tsk_stg == 0 || tsk_stg == null || key_step == 0 || key_step == null || tsk_resp == 0 || tsk_resp == null ||
        tsk_response == 0 || tsk_response == null || tsk_sts == 0 || tsk_sts == null
        || tsk_strdate == "" || tsk_strdate == null || tsk_est_mandays == "" || tsk_est_mandays == null ||
        tsk_revisestartdate == "" || tsk_revisestartdate == null || tsk_revisemanddays == "" || tsk_revisemanddays == null ||
        tsk_actualmanday == "" || tsk_actualmanday == null || tsk_allocationday == "" || tsk_allocationday == null || tsk_closuredate == "" || tsk_closuredate == null) {

        if (tsk_stg == 0 || tsk_stg == null) {
          $(document).find('#task_stage').css({ 'border': '1px solid red' });
          $(document).find('#task_stage').focus();
          flag = false;
        }
        if (key_step == 0 || key_step == null) {
          $(document).find('#task_keysteps').css({ 'border': '1px solid red' });
          $(document).find('#task_keysteps').focus();
          flag = false;
        }
        if (tsk_resp == 0 || tsk_resp == null) {
          $(document).find('#task_resp + .select2-container').css({ 'border': '1px solid red' });
          $(document).find('#task_resp').focus();
          flag = false;
        }
        if (tsk_response == 0 || tsk_response == null) {
          $(document).find('#task_responsibility + .select2-container').css({ 'border': '1px solid red' });
          $(document).find('#task_responsibility').focus();
          flag = false;
        }
        // if (tsk_description == "" || tsk_description == null) {
        //     $(document).find('#task_descrip').css({'border': '1px solid red'});
        //     $(document).find('#task_descrip').focus();
        //     flag = false;
        // }
        if (tsk_sts == 0 || tsk_sts == null) {
          $(document).find('#task_status').css({ 'border': '1px solid red' });
          $(document).find('#task_status').focus();
          flag = false;
        }
        if (tsk_strdate == 0 || tsk_strdate == null) {
          $(document).find('#task_startdate_new').css({ 'border': '1px solid red' });
          $(document).find('#task_startdate_new').focus();
          flag = false;
        }
        if (tsk_est_mandays == "" || tsk_est_mandays == null) {
          $(document).find('#task_estmandays_new').css({ 'border': '1px solid red' });
          $(document).find('#task_estmandays_new').focus();
          flag = false;
        }
        // if (tsk_enddate == "" || tsk_enddate == null) {
        //     $('#task_enddate').css("border", "1px solid red");
        //     $('#task_enddate').focus();
        // }
        if (tsk_revisestartdate == "" || tsk_revisestartdate == null) {
          $(document).find('#task_revisedstartdate_new').css({ 'border': '1px solid red' });
          $(document).find('#task_revisedstartdate_new').focus();
          flag = false;
        }
        if (tsk_revisemanddays == "" || tsk_revisemanddays == null) {
          $(document).find('#task_revisemandays_new').css({ 'border': '1px solid red' });
          $(document).find('#task_revisemandays_new').focus();
          flag = false;
        }
        // if (tsk_reviseenddate == "" || tsk_reviseenddate == null) {
        //     $('#task_revisedenddate').css("border", "1px solid red");
        //     $('#task_revisedenddate').focus();
        // }
        if (tsk_actualmanday == "" || tsk_actualmanday == null) {
          $(document).find('#task_acutalmandays').css({ 'border': '1px solid red' });
          $(document).find('#task_acutalmandays').focus();
          flag = false;
        }
        if (tsk_allocationday == "" || tsk_allocationday == null) {
          $(document).find('#task_allocationperday').css({ 'border': '1px solid red' });
          $('#task_allocationperday').focus();
          flag = false;
        }
        if (tsk_closuredate == "" || tsk_closuredate == null) {
          $(document).find('#task_closuredate').css({ 'border': '1px solid red' });
          $(document).find('#task_closuredate').focus();
          flag = false;
        }
      }
      console.log(flag);
      console.log(UpdateTask);

      if (flag) {
        var data = {
          projectIdentifier: ProjectIdentifier, stage: tsk_stg, keySteps: key_step, resp: tsk_resp,
          responsibility: tsk_response, taskDescription: tsk_description, taskStatus: tsk_sts,
          btComments: tsk_btcomment, pmComments: tsk_pmcomment, taskstartDate: tsk_strdate, taskendDate: tsk_enddate,
          taskestimateDays: tsk_est_mandays, taskrevisedManDays: tsk_revisemanddays, taskrevisedStartDate: tsk_revisestartdate,
          taskrevisedEndDate: tsk_reviseenddate, taskActualManDays: tsk_actualmanday, taskAllocationperDay: tsk_allocationday,
          taskClosureDate: tsk_closuredate, userIdentifier: CurrentUserIdentifier, taskIdentifier: taskIdentifier, taskid: 0, dependentTaskId: 0,
          projectId: 0, tblFlag: 0
        };
        console.log(data)

        $.ajax({
          url: apiURL + '/Task/InsertUpdateTask',
          method: 'POST',
          data: JSON.stringify(data),
          contentType: 'application/json',
          async: false,
          success: function (data) {
            console.log(data);
            if (data.responseCode == "200") {
              if (UpdateTask == 0) {
                $('#view_proj').show();
                // $('#upd_userlog_cmts').show();
                $('#update_task').hide();
                $('#task_manage').hide();
                $('#task_content').hide();
                $('#buttons').hide();
                taskIdentifier = "";
                DoClearValuesOfTask();
                Do_project_view(ProjectIdentifier);
              }
              else if (UpdateTask == 1) {
                $('#upd_userlog_cmts').hide();
                $('#task_manage').show();
                $('#pagination_container').show();
                $('#task_content').hide();
                $('#buttons').hide();
                DoGetTaskManagementData();
              }

            }
          },
          error: function (e) {
            console.log(e);
          }
        });
      }
    }

    function clear_project_form() {
      // $('#project_form_category').val("1");  // 1-> project ; others -> batch
      // $('#project_form_tagProject').val("");
      $('#project_form_commonProjectName').val("");
      $('#project_form_batchProjectSize').val("");
      $('#project_form_deadLine').val("");
      $('#project_form_targetGoLive').val("");
      $('#project_form_revisedGoLive').val("");
      $('#project_form_sponsers').val("");
      $('#project_form_pm').val("");
      $('#project_form_ba').val("");
      $('#project_form_baPriority').val("");
      $('#project_form_dev').val("");
      $('#project_form_devPriority').val("");
      $('#project_form_tester1').val("");
      $('#project_form_tester2').val("");
      $('#project_form_functionId').val("");
      $('#project_form_priority').val("");
      $('#project_form_currentStage').val("");
      $('#project_form_ragStatus').val("");
      $('#project_form_ragComment').val("");
    }

    function date_picker() {
      $('#upd_reviseend_date').datepicker({ dateFormat: "dd-mm-yy", minDate: 0 });
      $('#upd_reviseselect_date').datepicker({ dateFormat: "dd-mm-yy", minDate: 0 });
      $('#task_closuredate').datepicker({ dateFormat: "dd-mm-yy", minDate: 0 });
      $('#task_revisedenddate_new').datepicker({ dateFormat: "dd-mm-yy", minDate: 0 });
      // $('#task_revisemandays').datepicker({ dateFormat: "dd-mm-yy", minDate:0 });
      $('#task_revisedstartdate_new').datepicker({ dateFormat: "dd-mm-yy", minDate: 0 });
      $('#task_enddate_new').datepicker({ dateFormat: "dd-mm-yy", minDate: 0 });
      $('#project_form_revisedGoLive').datepicker({ dateFormat: "dd-mm-yy", minDate: 0 });
      $('#project_form_targetGoLive').datepicker({ dateFormat: "dd-mm-yy", minDate: 0 });
      $('#proj_deadline').datepicker({ dateFormat: "dd-mm-yy", minDate: 0 });
      $('#task_startdate_new').datepicker({ dateFormat: "dd-mm-yy", minDate: 0 });
      $(".task_date").datepicker({ dateFormat: "dd-mm-yy", minDate: 0 });
      // $("[id^='task_endDate_']").datepicker({ dateFormat: "dd-mm-yy", minDate:0 });
      // $("[id^='task_revisedStartDate_']").datepicker({ dateFormat: "dd-mm-yy", minDate:0 });
      // $("[id^='task_revisedEndDate_']").datepicker({ dateFormat: "dd-mm-yy", minDate:0 });
      // $("[id^='task_clousureDate_']").datepicker({ dateFormat: "dd-mm-yy", minDate:0 });
    }

    $(document).on('change', '#project_form_targetGoLive', function () {
      $('#project_form_revisedGoLive').val(this.value)
    })

    $(document).on('change', '#project_form_targetGoLive', function () {
      $('#task_revisedstartdate_new').val(this.value)
    })


    function hide_all_details() {
      $('#task_manage').hide();
      $('#task_content').hide();
      $('#proj_content').hide();
      $('#update_task').hide();
      $('#view_proj').hide();
      $('#buttons').hide();
      $('#upd_userlog_cmts').hide();
    }

    function task_hide_details() {
      $('#task_content').hide();
      $('#proj_content').hide();
      $('#update_task').hide();
      $('#view_proj').hide();
      $('#buttons').hide();
      $('#upd_userlog_cmts').hide();
    }

    function goToTab1() {
      $('#proj_summary_tbl').show();
      $('#pagination_container').show();
      $('#tab_content_bt').show();
      $(document).find('.upd_userlog_cmts').hide();
      // $(document).find('#cmts').hide();
      hide_all_details();
      DoGetProjectRecordsMethod();
      $('#projectSearchTerm').val("")
      ProjectReqObj = { ...ProjectReqObj, search: "", currentPage: 1, pageSize: 10, sortField: "", descFlag: true, batchIdentifier: "", userIdentifier: "" };
      ProjectIdentifier = "";
      sortFlag = true;
      pageFlag = 1;
      $('#page_filter').val("10");
    }

    function goToTab2() {
      $('#task_manage').show();
      task_hide_details();
      $('#proj_summary_tbl').hide();
      $('#pagination_container').show();
      $('#task_tab3').get(0).click();
      $('#task_inner_tab1').get(0).click();
      DoGetTaskManagementData();
      ProjectIdentifier = "";
      pageFlag = 2;
      $('#page_filter').val("10");
    }

    $('#tab1').on('click', function () {
      goToTab1();
    })

    $(document).on('click', '#return_projectgrid', goToTab1);

    $('#create_proj').on('click', function () {

      var button = $(this);
      var text = button.html();
      button.html('<div class="spinner-border spinner-border-sm" role="status"><span class="visually-hidden">Loading...</span></div> Create Project');
      setTimeout(async () => {
        ProjectIdentifier = "";
        FormNo = 1;
        clear_project_form();
        $('.projectList').hide()
        $('#tab_content_bt').hide();
        $('#cancel_btn').attr('data-bs-action', '');
        $('#retrn_task_page').attr('data-bs-action', '');
        $('#proj_summary_tbl').hide();
        // $('#tab_content_bt').hide();
        $('#pagination_container').hide();
        //$('#rqst_cntnt').show();
        $('#proj_content').show();
        $('#buttons').show();
        $('.project_form_style').css({ 'border': '1px solid gray', 'border-radius': '0px' });
        $(document).find('#project_form_pm + .select2-container').css({ 'border': '1px solid gray' });
        $(document).find('#project_form_ba + .select2-container').css({ 'border': '1px solid gray' });
        $(document).find('#project_form_dev + .select2-container').css({ 'border': '1px solid gray' });
        $(document).find('#project_form_tester2 + .select2-container').css({ 'border': '1px solid gray' });
        $(document).find('#project_form_tester1 + .select2-container').css({ 'border': '1px solid gray' });
        // $('.select2-selection--single').css('border','none');
        button.html(text);
      }, 100);

    })
    $('#tab2').on('click', function () {
      goToTab2();
    })

    $('#task_inner_tab1,#task_inner_tab2,#task_inner_tab3,#task_tab1,#task_tab2,#task_tab3,#task_tab4,#task_tab5').on('click', function () {
      DoGetTaskManagementData();
    })

    $('#srch_tsk').on('keyup', function () {
      DoGetTaskManagementData();
    })

    function DoGetTaskManagementData() {
      ////alert('hi');

      var dateTask = $("input[name=task_tabGroup1]:checked").val();
      var assignedFilter = $("input[name=task_inner_tabGroup1]:checked").val();
      console.log(dateTask, assignedFilter);
      var Taskdata = { taskIdentifier: "", dateTask: dateTask, assignedFilter: assignedFilter, startPage: taskstartPage, noofPages: taskTotalPage, sort: TasksortType, sortColumn: TasksortField, search: TasksearchVal, employeeIdentifier: CurrentUserIdentifier };
      $.ajax({
        url: apiURL + '/Task/DoGetAllTaskData',
        method: 'POST',
        async: false,
        contentType: 'application/json',
        data: JSON.stringify(Taskdata),
        //crossDomain: true,
        success: function (data: any) {
          console.log(data);
          var final_data = data.data;
          DoBindTaskManageTable(final_data);
          taskTotalRecords = data.recordCount;
          pagination(taskTotalRecords);
        },
        error: function (e: any) {
          //alert("error in getting data");
          console.log(e);
        }
      })
    }

    function DoBindTaskManageTable(data: any) {
      console.log(data);
      var html_head = "";
      var html_body = "";

      html_head += "<thead style='font-size:14px;'>";
      html_head += "<tr>";
      html_head += `<th class = '${styles.small_column_width}'>Actions</th>`;
      html_head += `<th id='taskid' class = 'task_sort_field ${styles.small_column_width}'>Task Id</th>`;
      html_head += `<th id='taskType' class = 'task_sort_field ${styles.small_column_width}'>Task Type</th>`;
      html_head += `<th id ='description' class = 'task_sort_field ${styles.small_column_width}'>Description</th>`;
      html_head += `<th id ='status' class = 'task_sort_field ${styles.small_column_width}'>Status</th>`;
      html_head += `<th id ='assignedothers' class = 'task_sort_field ${styles.big_column_width}' style = 'min-width:145px !important;'>Assigned By Others</th>`;
      html_head += `<th id ='assignedme' class = 'task_sort_field ${styles.small_column_width}'>Assigned To</th>`;
      html_head += `<th id ='startdate' class = 'task_sort_field ${styles.small_column_width}'>Start Date</th>`;
      html_head += `<th id ='targetdate' class = 'task_sort_field ${styles.small_column_width}'>Target Date</th>`;
      html_head += `<th class = "${styles.big_column_width}">Reference Id</th>`;
      html_head += "</tr>";
      html_head += "</thead>";

      if (data.length > 0) {
        html_body += '<tbody>';
        for (var i = 0; i < data.length; i++) {
          html_body += `<tr class="${styles.tbl_all_row}" style="font-size:12px;">`
          html_body += `<td><button type="button"
                class="btn btn-success ${styles.btn_create_proj} view_tsk_btn" id ="${data[i].taskIdentifier}_${data[i].stageIdentifier}_${data[i].batchIdentifier}">View</button></td>`;
          html_body += `<td>${data[i].taskId}</td>`;
          html_body += `<td>N/A</td>`
          html_body += `<td title="${data[i].taskDescription}">${truncateString(data[i].taskDescription, 20)}</td>`;

          if (data[i].taskStatus == "Delayed") {
            html_body += `<td><mark style="background-color: lightred; "color : #fff !important" class="${styles.rag_status}">Open</mark></td>`;
          }
          else if (data[i].taskStatus == "InProgress") {
            html_body += `<td><mark style="background-color: lightgreen; "color : #fff !important" class="${styles.rag_status}">In Progress</mark></td>`;
          }
          else if (data[i].taskStatus == "Completed") {
            html_body += `<td><mark style="background-color: palegreen; "color : #fff !important" class="${styles.rag_status}">Completed</mark></td>`;
          }
          else if (data[i].taskStatus == "Not Started") {
            html_body += `<td><mark style="background-color: lightblue; "color : #fff !important" class="${styles.rag_status}">Not Started</mark></td>`;
          }
          else if (data[i].taskStatus == "On Hold") {
            html_body += `<td><mark style="background-color: lightorange; "color : #fff !important" class="${styles.rag_status}">On Hold</mark></td>`;
          }
          else if (data[i].taskStatus == "Needs Help") {
            html_body += `<td><mark style="background-color: lightyellow; "color : #fff !important" class="${styles.rag_status}">Need Help</mark></td>`;
          }
          else if (data[i].taskStatus == "N/A") {
            html_body += `<td><mark style="background-color: #636e72 "color : #fff !important" class="${styles.rag_status}">N/A</mark></td>`;
          }
          else {
            html_body += `<td>N/A</td>`
          }
          html_body += `<td>${data[i].taskAssignedbyOthers}</td>`;
          html_body += `<td>${data[i].taskAssignedto}</td>`;
          html_body += `<td  style = 'text-align:right'>${data[i].taskStartDate}</td>`;
          html_body += `<td  style = 'text-align:right'>${data[i].taskTargetDate}</td>`;
          html_body += `<td>N/A</td>`
          html_body += `</tr>`;
        }
        html_body += `</tbody>`;
      }
      else {
        html_body += "<tbody style = 'font-size:12px;'>";
        html_body += "<tr><td colspan='10' style = 'text-align:center;'>No Records Found...<td></tr>";
        html_body += "</tbody>";
      }
      $('#tsk_tbl').html(html_head + html_body);



    }

    $(document).on('click', '#retrn_menu', function () {
      goToTab1();
    })

    $(document).on('click', '.view_tsk_btn', function (e: any) {
      // var tsk_id = this.id;
      var idparts = (this.id).split('_');
      var taskIdentifier =  idparts[0];
      var stageIdentifer = idparts[1];
      var projectIdentifier = idparts[2];
      //var Taskdata = { taskIdentifier: tsk_id, dateTask: 0, assignedFilter: 0, startPage: 0, noofPage: 10, sort: "", sortColumn: "", search: "", employeeIdentifier: CurrentUserIdentifier };
      var button = $(this);
      button.html('<div class="spinner-border spinner-border-sm" role="status"><span class="visually-hidden">Loading...</span></div> View');
      setTimeout(async () => {
        await Do_project_view(projectIdentifier);
        // $(`#acc_${stageIdentifer}`).click();

        for (let i = 0; i < lst.length; i++) {
          if (lst[i] === stageIdentifer) {
            TaskId = stageIdentifer;
            currStage = i;
            $('.data_' + lst[i]).show();
            $('#arrow_down_' + lst[i]).css("transform", "rotate(180deg)", "transition", "0.5s");
          } else {
            $('.data_' + lst[i]).hide();
            $('#arrow_down_' + lst[i]).css("transform", "rotate(360deg)", "transition", "0.5s");
          }
        }

        $(`#card_bdy_${taskIdentifier}`).focus();
        button.html('View');
      }, 500);
    });

    function DoViewTaskRecord(TaskData) {
      $.ajax({
        url: apiURL + '/Task/DoGetAllTaskData',
        method: 'POST',
        async: false,
        contentType: 'application/json',
        data: JSON.stringify(TaskData),
        //crossDomain: true,
        success: function (data: any) {
          console.log(data);
          var task_data = data.data[0];
          $('#task_manage').hide();
          $('#pagination_container').hide();
          $('#buttons').show();
          $('#task_content').show();
          $('#tsk_head').html("Update Task - " + task_data.taskId);
          $('#retrn_task_page').data('bs-action', 'rtrntask_page');
          $('#cancel_btn').data('bs-action', 'rtrntask_page');
          DoShowTaskData(task_data);
        },
        error: function (e: any) {
          //alert("error in getting data");
          console.log(e);
        }
      })
    }


    function DoShowTaskData(data: any) {
      clear_Task_Validation();
      FormNo = 2;
      UpdateTask = 1;
      if (data != null) {
        ProjectIdentifier = data.projectIdentifier;
        taskIdentifier = data.taskIdentifier;
        $('#task_taskid').val(data.taskId).prop('disabled', true);
        $('#task_dependentid').val(data.dependentId).prop('disabled', true);
        $('#task_stage').val(data.stage).prop('disabled', true);
        $('#task_keysteps').val(data.keyStep).prop('disabled', true);
        isProgrammaticChange = true;
        $('#task_resp').val(data.resp).trigger('change').prop('disabled', true);
        $('#task_responsibility').val(data.responsibility).trigger('change').prop('disabled', true);
        isProgrammaticChange = false;
        $('#task_descrip').val(data.taskDescription).prop('disabled', true);
        $('#task_status').val(data.statusIdentifier);
        $('#task_commentsbt').val(data.btComments).prop('disabled', true);
        $('#task_commentspm').val(data.pmComments).prop('disabled', true);
        $('#task_startdate_new').val(data.startDate).prop('disabled', true);
        $('#task_estmandays_new').val(data.estManDays).prop('disabled', true);
        $('#task_enddate_new').val(data.endDate).prop('disabled', true);
        $('#task_revisedstartdate_new').val(data.revisedStartDate).prop('disabled', true);
        $('#task_revisemandays_new').val(data.revisedManDays).prop('disabled', true);
        $('#task_revisedenddate_new').val(data.revisedEndDate).prop('disabled', true);
        $('#task_acutalmandays').val(data.actualManDays).prop('disabled', true);
        $('#task_allocationperday').val(data.allocationPerDay).prop('disabled', true);
        $('#task_closuredate').val(data.clousureDate).prop('disabled', true);
      }
    }


    $('.retrn_main_page').on('click', function () {
      closeContent();
    })
    $('#cancel_btn').on('click', function () {
      var action = $(this).data('bs-action');
      if (action == "rtrnupd_proj") {
        $('#view_proj').show();
        // $('#upd_userlog_cmts').show();
        $('#update_task').hide();
        $('#task_manage').hide();
        $('#task_content').hide();
        $('#buttons').hide();
        $(this).data('bs-action', '');
        $('#retrn_task_page').data('bs-action', '');
      }
      else if (action == "rtrntask_page") {
        // $('#upd_userlog_cmts').hide();
        $('#task_manage').show();
        $('#pagination_container').show();
        $('#task_content').hide();
        $('#buttons').hide();
        $(this).data('bs-action', 'normal');
        $('#retrn_task_page').data('bs-action', '');
      }
      else {
        closeContent();
      }
    })
    function closeContent() {
      $('#tab1').get(0).click();
      $('#task_content').hide();
      $('#proj_content').hide();
      $('#update_task').hide();
      $('#view_proj').hide();
      $('#buttons').hide();
      // $('#upd_userlog_cmts').hide();
    }

    $('#crt_tsk').on('click', function () {
      FormNo = 2
      taskIdentifier = "";
      $(document).find('.upd_userlog_cmts').hide();
      DoShowCreateTask();
    })

    function doReturnToProjectView() {
      $('#view_proj').show();
      $('#upd_userlog_cmts').show();
      $('#update_task').hide();
      $('#task_manage').hide();
      $('#task_content').hide();
      $('#buttons').hide();
      BindProjectViewData();
      taskIdentifier = "";
    }

    $('#retrn_task').on('click', function () {
      TaskIdentifier = "";
      doReturnToProjectView();
    })

    $('#retrn_task_page').on('click', function () {
      $(document).find('.upd_userlog_cmts').show();
      var action = $(this).data('bs-action');
      console.log(action);
      if (action == "rtrnupd_proj") {
        $('#view_proj').show();
        // $('#upd_userlog_cmts').show();
        $('#update_task').hide();
        $('#task_manage').hide();
        $('#task_content').hide();
        $('#buttons').hide();

        // Remove the data-bs-action attribute
        $(this).data('bs-action', '');
        $('#cancel_btn').data('bs-action', '');
      } else if (action == "rtrntask_page") {
        // $('#upd_userlog_cmts').hide();
        $('#task_manage').show();
        $('#pagination_container').show();
        $('#task_content').hide();
        $('#buttons').hide();

        // Remove the data-bs-action attribute
        $(this).data('bs-action', '');
        $('#cancel_btn').data('bs-action', '');
      }
    });

    $('.view_task_btn').on('click', function () {
      $('#task_manage').hide();
      $('#pagination_container').hide();
      $('#buttons').show();
      $('#task_content').show();
      $('#retrn_task_page').data('bs-action', 'rtrntask_page');
      $('#cancel_btn').data('bs-action', 'rtrntask_page');
    })

    function DoShowCreateTask() {
      FormNo = 2;
      taskIdentifier = "";
      UpdateTask = 0;
      $('#view_proj').hide();
      // $('#upd_userlog_cmts').hide();
      $('#task_content').show();
      $('#tsk_head').html("Create Task");
      $('#buttons').show();
      $('#retrn_task_page').data('bs-action', 'rtrnupd_proj');
      $('#cancel_btn').data('bs-action', 'rtrnupd_proj');
      DoClearValuesOfTask();
      DoBindDropdownDetails();
    }
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
