"use client";

import { useState, useEffect } from "react";
import FreelancerListing from "../freelancer/FreelancerListing";
import { fetchFreelancers } from "../../lib/freelancers";
import { Freelancer } from "../../types";

interface BrowseFreelancersProps {
  onHire: (freelancerAddress: string) => void;
  loading?: boolean;
}

export default function BrowseFreelancers({ onHire, loading }: BrowseFreelancersProps) {
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    loadFreelancers();
  }, []);

  const loadFreelancers = async () => {
    setFetching(true);
    const data = await fetchFreelancers();
    setFreelancers(data);
    setFetching(false);
  };

  return (
    <FreelancerListing
      freelancers={freelancers}
      onHire={onHire}
      loading={fetching || loading}
    />
  );
}