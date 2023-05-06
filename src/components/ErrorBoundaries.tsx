import React, { ErrorInfo, ReactElement } from 'react';
interface ErrorBoundaryState {
    hasError: boolean
    errorMessage: string
}
interface ErrorboundaryProps {
    children: ReactElement
}
export class ErrorBoundaries extends React.Component<ErrorboundaryProps, ErrorBoundaryState>
{
    constructor(props: ErrorboundaryProps)
    {
        super(props)
        this.state = {
            hasError : false,
            errorMessage: ''
        }
    }
    componentDidCatch(error: Error, errorInfo: ErrorInfo)
    {
        this.setState({ hasError: true })
        this.setState({ errorMessage: error.message })
        //Do something with err and errorInfo
    }
    render(): React.ReactNode 
    {
        if(this.state?.hasError)
        {
            return(
                <div className="client-error">
                    <p><h3>OOPS! Alguma coisa deu errado:</h3></p>
                    { this.state.errorMessage }
                    <br />
                    <br />
                    <br />
                    <br />
                    <a href="#" onClick={ () => window.location.reload() }>Clique aqui para tentar novamente.</a>
                </div>
            )
        }
        return(this.props.children)
    }
}