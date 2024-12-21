{{/*
Expand the name of the chart.
*/}}
{{- define "ciso-assistant-next.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "ciso-assistant-next.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default .Chart.Name .Values.nameOverride -}}
{{- if contains $name .Release.Name -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
{{- end -}}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "ciso-assistant-next.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/* 
Create CISO Application app version.
*/}}
{{- define "ciso-assistant-next.defaultTag" -}}
{{- default .Chart.AppVersion .Values.global.image.tag -}}
{{- end -}}

{{/*
Return valid version label
*/}}
{{- define "ciso-assistant-next.versionLabelValue" -}}
{{ regexReplaceAll "[^-A-Za-z0-9_.]" (include "ciso-assistant-next.defaultTag" .) "-" | trunc 63 | trimAll "-" | trimAll "_" | trimAll "." | quote }}
{{- end -}}

{{/*
Common labels
*/}}
{{- define "ciso-assistant-next.labels" -}}
helm.sh/chart: {{ include "ciso-assistant-next.chart" .context }}
{{ include "ciso-assistant-next.selectorLabels" (dict "context" .context "component" .component "name" .name) }}
app.kubernetes.io/managed-by: {{ .context.Release.Service }}
app.kubernetes.io/part-of: ciso-assistant-next
app.kubernetes.io/version: {{ include "ciso-assistant-next.versionLabelValue" .context }}
{{- with .context.Values.global.commonLabels }}
{{ toYaml . }}
{{- end }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "ciso-assistant-next.selectorLabels" -}}
{{- if .name -}}
app.kubernetes.io/name: {{ include "ciso-assistant-next.name" .context }}-{{ .name }}
{{ end -}}
app.kubernetes.io/instance: {{ .context.Release.Name }}
{{- if .component }}
app.kubernetes.io/component: {{ .component }}
{{- end }}
{{- end }}



