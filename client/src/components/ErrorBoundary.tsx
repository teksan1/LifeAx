import React from "react";
import { noop } from "@lib/utils";

type Props = { children: React.ReactNode };
type State = { hasError: boolean };

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: any, info: any) { log(error, info); }
  render() { return this.state.hasError ? <div>Error</div> : this.props.children; }
}
