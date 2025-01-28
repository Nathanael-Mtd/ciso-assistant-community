import { BASE_API_URL } from '$lib/utils/constants';
import { composerSchema } from '$lib/utils/schemas';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { PageServerLoad } from './$types';
import type { Project } from '$lib/utils/types';
import { TODAY } from '$lib/utils/constants';
import * as m from '$paraglide/messages';

const REQUIREMENT_ASSESSMENT_STATUS = [
	'compliant',
	'partially_compliant',
	'in_progress',
	'non_compliant',
	'not_applicable',
	'to_do'
] as const;

interface DonutItem {
	name: string;
	localName?: string;
	value: number;
	itemStyle: Record<string, unknown>;
}

interface RequirementAssessmentDonutItem extends Omit<DonutItem, 'name'> {
	name: (typeof REQUIREMENT_ASSESSMENT_STATUS)[number];
	percentage: string;
}

interface ProjectAnalytics extends Project {
	overallCompliance: {
		values: RequirementAssessmentDonutItem[];
		total: number;
	};
}

export const load: PageServerLoad = async ({ locals, fetch }) => {
	const req_applied_control_status = await fetch(`${BASE_API_URL}/applied-controls/per_status/`);
	const applied_control_status = await req_applied_control_status.json();

	const riskAssessmentsPerStatus = await fetch(`${BASE_API_URL}/risk-assessments/per_status/`)
		.then((res) => res.json())
		.then((res) => res.results);
	const complianceAssessmentsPerStatus = await fetch(
		`${BASE_API_URL}/compliance-assessments/per_status/`
	)
		.then((res) => res.json())
		.then((res) => res.results);
	const riskScenariosPerStatus = await fetch(`${BASE_API_URL}/risk-scenarios/per_status/`)
		.then((res) => res.json())
		.then((res) => res.results);

	const req_ord_applied_controls = await fetch(`${BASE_API_URL}/applied-controls/todo/`);
	const ord_applied_controls = await req_ord_applied_controls.json();

	function timeState(date: string) {
		const eta = new Date(date);
		if (eta.getTime() > TODAY.getTime()) {
			return { name: 'incoming', hexcolor: '#93c5fd' };
		} else if (eta.getTime() < TODAY.getTime()) {
			return { name: 'outdated', hexcolor: '#f87171' };
		} else {
			return { name: 'today', hexcolor: '#fbbf24' };
		}
	}

	for (const applied_control of ord_applied_controls.results) {
		applied_control.state = timeState(applied_control.eta);
	}

	const req_get_counters = await fetch(`${BASE_API_URL}/get_counters/`);
	const counters = await req_get_counters.json();

	const req_get_metrics = await fetch(`${BASE_API_URL}/get_metrics/`);
	const metrics = await req_get_metrics.json();

	const usedRiskMatrices: { id: string; name: string; risk_assessments_count: number }[] =
		await fetch(`${BASE_API_URL}/risk-matrices/used/`)
			.then((res) => res.json())
			.then((res) => res.results);
	const usedFrameworks: { id: string; name: string; compliance_assessments_count: number }[] =
		await fetch(`${BASE_API_URL}/frameworks/used/`)
			.then((res) => res.json())
			.then((res) => res.results);
	const req_get_risks_count_per_level = await fetch(
		`${BASE_API_URL}/risk-scenarios/count_per_level/`
	);
	const risks_count_per_level: {
		current: Record<string, any>[];
		residual: Record<string, any>[];
	} = await req_get_risks_count_per_level.json().then((res) => res.results);

	const threats_count = await fetch(`${BASE_API_URL}/threats/threats_count/`).then((res) =>
		res.json()
	);

	const req_get_measures_to_review = await fetch(`${BASE_API_URL}/applied-controls/to_review/`);
	const measures_to_review = await req_get_measures_to_review.json();

	for (const measure of measures_to_review.results) {
		measure.state = timeState(measure.expiry_date);
	}

	const req_get_acceptances_to_review = await fetch(`${BASE_API_URL}/risk-acceptances/to_review/`);
	const acceptances_to_review = await req_get_acceptances_to_review.json();

	for (const acceptance of acceptances_to_review.results) {
		acceptance.state = timeState(acceptance.expiry_date);
	}

	const req_risk_assessments = await fetch(`${BASE_API_URL}/risk-assessments/`);
	const risk_assessments = await req_risk_assessments.json();

	const composerForm = await superValidate(zod(composerSchema));

	return {
		composerForm,
		usedRiskMatrices,
		usedFrameworks,
		riskAssessmentsPerStatus,
		complianceAssessmentsPerStatus,
		riskScenariosPerStatus,
		risks_count_per_level,
		threats_count,
		measures_to_review: measures_to_review.results,
		acceptances_to_review: acceptances_to_review.results,
		risk_assessments: risk_assessments.results,
		get_counters: counters.results,
		measures: ord_applied_controls.results,
		applied_control_status: applied_control_status.results,
		user: locals.user,
		metrics: metrics.results,
		title: m.analytics()
	};
};
