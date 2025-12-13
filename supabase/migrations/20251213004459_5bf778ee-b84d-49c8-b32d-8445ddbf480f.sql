-- Add unique constraint for test scenarios
ALTER TABLE public.test_scenarios ADD CONSTRAINT test_scenarios_hub_scenario_unique UNIQUE (hub_name, scenario_name);