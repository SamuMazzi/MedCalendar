import React, { Component } from "react";
import { Paper, Button, Typography, IconButton } from "@mui/material";
import { format, addYears, addMonths, setMonth, setYear } from "date-fns";
import ChevronLeftRounded from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRounded from "@mui/icons-material/ChevronRightRounded";
import DisplayMonthlyCalendar from "./DisplayMonthlyCalendar";
import DisplayDailyCalendar from "./DisplayDailyCalendar";
import DailyYearlyCalendar from "./DisplayYearlyCalendar";

//Material theme
import { ThemeProvider } from "@mui/material";
import { darkTheme, lightTheme } from "./muitheme";

export default class Calendar extends Component<any> {
  state = {
    selectedDate: new Date(),
    selectedMonth: new Date(),
    mode: 0,
    showFunctionalHeader: true,
    selectStartandEnd: false,
    selected1: null,
    selected2: null,
    functionalMode: false
  };

  /***************************************************************************************
   * Calender Header functions
   ***************************************************************************************/

  /**
   * Depending on the mode, the calendar header will render different text.
   */
  renderHeader = () => {
    const dateYearFormat = "YYYY";
    const dateMonthFormat = "MMMM yyyy";
    let header;
    if (this.state.mode === 0) {
      header = (
        <Typography variant="h5">
          {/**inline={true} */}
          {format(this.state.selectedDate, dateMonthFormat)}
        </Typography>
      );
    } else if (this.state.mode === 1) {
      header = (
        <Typography variant="h5">
          {/**inline={true} */}
          {format(this.state.selectedDate, dateYearFormat)}
        </Typography>
      );
    } else {
      const pastFiveYears = addYears(this.state.selectedDate, -9);
      const nextFiveYears = addYears(this.state.selectedDate, 2);
      header = (
        <Typography variant="h5">
          {/**inline={true} */}
          {format(pastFiveYears, dateYearFormat)} -{" "}
          {format(nextFiveYears, dateYearFormat)}
        </Typography>
      );
    }

    return (
      <Paper
        style={{
          backgroundColor: "rgba(0,0,0,0)",
          minHeight: "5%"
        }}
      >
        <IconButton onClick={() => this.onChevronClick(true)}>
          <ChevronLeftRounded />
        </IconButton>
        <Button onClick={this.modeChange}>{header}</Button>
        <IconButton onClick={() => this.onChevronClick(false)}>
          <ChevronRightRounded />
        </IconButton>
      </Paper>
    );
  };

  /**
   * Render the header but without mode change.
   */
  renderYearHeader = () => {
    const dateYearFormat = "YYYY";
    let header;

    const pastFiveYears = addYears(this.state.selectedDate, -9);
    const nextFiveYears = addYears(this.state.selectedDate, 2);
    header = (
      <Typography variant="h5">
        {/** TODO: Aggiungi versione aggiornata di questo inline={true} */}
        {format(pastFiveYears, dateYearFormat)} -{" "}
        {format(nextFiveYears, dateYearFormat)}
      </Typography>
    );

    return (
      <Paper
        style={{
          backgroundColor: "rgba(0,0,0,0)",
          minHeight: "5%"
        }}
      >
        <IconButton onClick={() => this.yearChevronClick(true)}>
          <ChevronLeftRounded />
        </IconButton>
        {header}
        <IconButton onClick={() => this.yearChevronClick(false)}>
          <ChevronRightRounded />
        </IconButton>
      </Paper>
    );
  };

  /*
   * Clicking on the header will change the mode between days, months and years.
   */
  modeChange = () => {
    if (this.state.mode === 0) {
      this.setState({ mode: 1 });
    } else if (this.state.mode === 1) {
      this.setState({ mode: 2, selectedDate: new Date() });
    } else {
      this.setState({ mode: 0, selectedDate: new Date() });
    }
  };

  /*
   * Clicking on the chevron buttons next to the calendar will add or subtract months/year/decades.
   */
  onChevronClick = (direction: boolean) => {
    if (direction) {
      if (this.state.mode === 0) {
        this.setState({
          selectedDate: addMonths(this.state.selectedDate, -1)
        });
      } else if (this.state.mode === 1) {
        this.setState({
          selectedDate: addYears(this.state.selectedDate, -1)
        });
      } else {
        this.setState({
          selectedDate: addYears(this.state.selectedDate, -9)
        });
      }
    } else {
      if (this.state.mode === 0) {
        this.setState({
          selectedDate: addMonths(this.state.selectedDate, 1)
        });
      } else if (this.state.mode === 1) {
        this.setState({
          selectedDate: addYears(this.state.selectedDate, 1)
        });
      } else {
        this.setState({
          selectedDate: addYears(this.state.selectedDate, 9)
        });
      }
    }
  };

  /*
   * Clicking on the chevron buttons next to the calendar will add or subtract months/year/decades.
   */
  yearChevronClick = (direction: boolean) => {
    if (direction) {
      this.setState({
        selectedDate: addYears(this.state.selectedDate, -9)
      });
    } else {
      this.setState({
        selectedDate: addYears(this.state.selectedDate, 9)
      });
    }
  };

  /***************************************************************************************
   * Calendar functions (on click)
   ***************************************************************************************/

  /**
   * Clicking on a date in mode 0 (Day calendar mode)
   */
  onDateClick = (day: Date) => {
    this.setState({
      selectedDate: day
    });

    //This is for returning date when publishing
    if (
      this.props.selection !== undefined &&
      this.props.mode !== "month" &&
      this.props.mode !== "year"
    ) {
      this.props.selection(day);
    }
  };

  /**
   * Clicking on a month in mode 1 will set the month and return back to the day calendar.(Monthly calendar mode)
   * If explicitly set to month mode, it will only return the month value.
   * Else it will change back to mode 0.
   */
  onSetMonth = (value: number) => {
    if (this.props.selection !== undefined && this.props.mode === "month") {
      this.props.selection(value);
    } else {
      var result = setMonth(this.state.selectedDate, value);
      this.setState({ selectedDate: result, mode: 0 });
    }
  };

  /**
   * Clicking on a year in mode 2 will set the year and return back to monthly calendar. (Yearly calendar mode)
   * If explicitly set to year mode, it will only return the year value.
   * Else it will change back to mode 1.
   */
  onYearClick = (value: number) => {
    if (this.props.selection !== undefined && this.props.mode === "year") {
      this.props.selection(value);
    } else {
      this.setState({
        mode: 1,
        selectedDate: setYear(this.state.selectedDate, value)
      });
    }
  };

  /***************************************************************************************
   * Renders the entire body of the calendar
   * Alternate between day, month and year.
   ***************************************************************************************/

  /**
   * Renders the regular calendar that can switch between day, month and year view.
   */
  defaultDaySelector = () => {
    let textColor;
    if (this.props.light) {
      textColor = { color: "rgba(0,0,0,1)" };
    } else {
      textColor = { color: "rgba(256,256,256,1)" };
    }
    let body;
    if (this.state.mode === 0) {
      body = (
        <DisplayDailyCalendar
          selectedDate={this.state.selectedDate}
          onDateClick={this.onDateClick}
          light={textColor}
        />
      );
    } else if (this.state.mode === 1) {
      body = (
        <DisplayMonthlyCalendar
          onSetMonth={this.onSetMonth}
          light={textColor}
        />
      );
    } else {
      body = (
        <DailyYearlyCalendar
          year={this.state.selectedDate}
          onSetYear={this.onYearClick}
          light={textColor}
        />
      );
    }

    return (
      <div style={{ height: "100%" }}>
        {this.renderHeader()}
        {body}
      </div>
    );
  };

  /**
   * Only render the month calendar and does not switch modes.
   */
  monthSelector = () => {
    let textColor;
    if (this.props.light) {
      textColor = { color: "rgba(0,0,0,1)" };
    } else {
      textColor = { color: "rgba(256,256,256,1)" };
    }
    return (
      <DisplayMonthlyCalendar onSetMonth={this.onSetMonth} light={textColor} />
    );
  };

  /**
   * Only render the year calendar and does not switch modes.
   */
  yearSelector = () => {
    let textColor;
    if (this.props.light) {
      textColor = { color: "rgba(0,0,0,1)" };
    } else {
      textColor = { color: "rgba(256,256,256,1)" };
    }
    return (
      <div style={{ height: "100%" }}>
        {this.renderYearHeader()}
        <DailyYearlyCalendar
          year={this.state.selectedDate}
          onSetYear={this.onYearClick}
          light={textColor}
        />
      </div>
    );
  };
  //year={this.state.selectedDate}
  /**
   * Depending on the props given, renders the different modes.
   */
  modeSelector = () => {
    if (this.props.mode === "year") {
      return this.yearSelector();
    } else if (this.props.mode === "month") {
      return this.monthSelector();
    } else {
      return this.defaultDaySelector();
    }
  };
  /**
   * Main render method
   */
  render() {
    return (
      <ThemeProvider theme={this.props.light ? lightTheme : darkTheme}>
        <Paper style={this.props.generalStyle}>{this.modeSelector()}</Paper>
      </ThemeProvider>
    );
  }
}
