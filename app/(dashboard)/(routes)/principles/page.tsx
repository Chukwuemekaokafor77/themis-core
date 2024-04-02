"use client";
import React from 'react';

const ListComponent = () => {
    const canadianLawPrinciples = [
        {
          name: "Rule of Law",
          description: "The principle that all people and institutions are subject to and accountable to law that is fairly applied and enforced.",
          url: "https://www.justice.gc.ca/eng/csj-sjc/just/02.html"
        },
        {
          name: "Equality Before the Law",
          description: "All individuals are equal before the law and are entitled to equal protection of the law without discrimination.",
          url: "https://www.justice.gc.ca/eng/csj-sjc/just/02.html"
        },
        {
          name: "Legal Rights in the Canadian Charter of Rights and Freedoms",
          description: "Rights that protect individuals in their dealings with the justice system and law enforcement, such as the right to be free from unreasonable search and seizure and the right to a fair trial.",
          url: "https://www.thecanadianencyclopedia.ca/en/article/law"
        },
        {
          name: "Stare Decisis",
          description: "The doctrine that the decisions of higher courts bind lower courts in the same jurisdiction.",
          url: "https://en.wikipedia.org/wiki/Law_of_Canada"
        },
        {
          name: "Common Law and Civil Law",
          description: "Canada's legal system is bijural, featuring both common law (in all provinces except Quebec) and civil law (in Quebec).",
          url: "https://en.wikipedia.org/wiki/Law_of_Canada"
        },
        {
          name: "Indigenous Legal Traditions",
          description: "Recognition of the legal traditions and practices of Indigenous peoples within Canada's legal system.",
          url: "https://en.wikipedia.org/wiki/Law_of_Canada"
        },
        {
          name: "Public and Private Law",
          description: "The distinction between laws governing relationships between individuals (private law) and laws concerning the relationship between individuals and society (public law).",
          url: "https://www.thecanadianencyclopedia.ca/en/article/law"
        },{
            name: "Federalism",
            description: "The division of powers and responsibilities between the national (federal) government and provincial governments.",
            url: "https://en.wikipedia.org/wiki/Law_of_Canada"
          },
          {
            name: "Judicial Review",
            description: "The ability of courts to interpret, review, and sometimes nullify laws and actions by other branches of government that are found to be unconstitutional.",
            url: "https://www.thecanadianencyclopedia.ca/en/article/law"
          },
          {
            name: "Legal Pluralism",
            description: "The coexistence of multiple legal systems within Canada, including Indigenous laws, common law, and civil law.",
            url: "https://en.wikipedia.org/wiki/Law_of_Canada"
          },
          {
            name: "Presumption of Innocence",
            description: "The principle that an individual is considered innocent until proven guilty in a court of law.",
            url: "https://www.justice.gc.ca/eng/csj-sjc/just/02.html"
          },
          {
            name: "Rights of the Accused",
            description: "Rights granted to individuals accused of crimes, including the right to be informed of charges, the right to legal representation, and the right to a fair trial.",
            url: "https://www.justice.gc.ca/eng/csj-sjc/just/02.html"
          },
          {
            name: "Environmental Law",
            description: "Laws and regulations that govern the protection of the environment and natural resources.",
            url: "https://www.thecanadianencyclopedia.ca/en/article/environmental-law"
          },
          {
            name: "Labour and Employment Law",
            description: "Regulations concerning the rights and obligations of employers and employees, workplace safety, and collective bargaining.",
            url: "https://www.thecanadianencyclopedia.ca/en/article/labour-law"
          },
          {
            name: "Family Law",
            description: "Laws pertaining to familial relationships, including marriage, divorce, child custody, and adoption.",
            url: "https://www.justice.gc.ca/eng/fl-df/"
          },
          {
            name: "Consumer Protection Law",
            description: "Laws designed to protect consumers from unfair business practices and ensure fair trade competition.",
            url: "https://www.competitionbureau.gc.ca/eic/site/cb-bc.nsf/eng/home"
          },
          {
            name: "Intellectual Property Law",
            description: "Regulations governing the protection of inventions, designs, trademarks, and copyrighted works.",
            url: "https://www.ic.gc.ca/eic/site/cipointernet-internetopic.nsf/eng/home"
          },
          {
            name: "Privacy Law",
            description: "Laws that govern the collection, use, and disclosure of personal information by public and private entities.",
            url: "https://www.priv.gc.ca/en/"
          }
      ];
      

      return (
        <div className="min-h-screen bg-gray-100 py-8">
          <ul className="space-y-4 px-8">
            {canadianLawPrinciples.map((item, index) => (
              <li key={index} className="p-4 bg-white rounded shadow">
                <a href={item.url} className="text-black-500 hover:text-blue-600 transition-colors">
                  <h2 className="text-xl font-bold">{item.name}</h2>
                  <p>{item.description}</p>
                </a>
              </li>
            ))}
          </ul>
        </div>
      );
};

export default ListComponent;