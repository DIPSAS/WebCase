"use client";

import React, { Component } from "react";

interface CardProps {
  title: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  onToggle?: (collapsed: boolean) => void;
}

interface CardState {
  isCollapsed: boolean;
  renderCount: number;
}

// Legacy class component - consider migrating to functional component
export class Card extends Component<CardProps, CardState> {
  constructor(props: CardProps) {
    super(props);
    this.state = {
      isCollapsed: props.defaultCollapsed || false,
      renderCount: 0,
    };
    // Binding methods in constructor - old pattern
    this.handleToggle = this.handleToggle.bind(this);
    this.renderHeader = this.renderHeader.bind(this);
  }

  componentDidMount() {
    console.log("Card component mounted");
  }

  componentDidUpdate(prevProps: CardProps, prevState: CardState) {
    // Unnecessary state update causing extra renders
    if (prevState.isCollapsed !== this.state.isCollapsed) {
      this.setState({ renderCount: this.state.renderCount + 1 });
    }
  }

  handleToggle() {
    const newCollapsed = !this.state.isCollapsed;
    this.setState({ isCollapsed: newCollapsed });
    if (this.props.onToggle) {
      this.props.onToggle(newCollapsed);
    }
  }

  renderHeader() {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 16px",
          background: "#f5f5f5",
          borderBottom: this.state.isCollapsed ? "none" : "1px solid #ddd",
          cursor: this.props.collapsible ? "pointer" : "default",
        }}
        onClick={this.props.collapsible ? this.handleToggle : undefined}
      >
        <h3 style={{ margin: 0, fontSize: "16px" }}>{this.props.title}</h3>
        {this.props.collapsible && (
          <span style={{ fontSize: "12px" }}>
            {this.state.isCollapsed ? "▶" : "▼"}
          </span>
        )}
      </div>
    );
  }

  render() {
    return (
      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: "4px",
          marginBottom: "16px",
          background: "white",
        }}
      >
        {this.renderHeader()}
        {!this.state.isCollapsed && (
          <div style={{ padding: "16px" }}>{this.props.children}</div>
        )}
      </div>
    );
  }
}
