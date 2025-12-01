import React from 'react';
import Chart from 'react-apexcharts';

type ChartProps = {
	[x: string]: any;
};
type ChartState = {
	chartData: any[];
	chartOptions: any;
};

class ColumnChart extends React.Component<ChartProps, ChartState> {
	constructor(props: { chartData: any[]; chartOptions: any }) {
		super(props);
		this.state = {
			chartData: [],
			chartOptions: {}
		};
	}
	componentDidUpdate(prevProps: ChartProps) {
		if (
		  prevProps.chartData !== this.props.chartData ||
		  prevProps.chartOptions !== this.props.chartOptions
		) {
		  this.setState({
			chartData: this.props.chartData,
			chartOptions: this.props.chartOptions
		  });
		}
	}

	componentDidMount() {
		this.setState({
			chartData: this.props.chartData,
			chartOptions: this.props.chartOptions
		});
	}

	render() {
		return (
			<Chart
				options={this.state.chartOptions}
				series={this.state.chartData}
				type='bar'
				width='100%'
				height='100%'
			/>
		);
	}
}

export default ColumnChart;
