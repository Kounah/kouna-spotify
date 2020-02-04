import nunjucks, { ConfigureOptions } from "nunjucks";
import express from "express";

export interface NunjucksConfig extends ConfigureOptions {

}

export default function configureNunjucks(config: NunjucksConfig, viewdir?: string) {
  const nun = nunjucks.configure(viewdir, config);

  return nun;
}
