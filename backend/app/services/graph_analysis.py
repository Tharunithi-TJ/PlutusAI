import networkx as nx
import pandas as pd
from itertools import combinations
from collections import defaultdict
from flask import current_app
from app.models.claims import Claim
from app.models.policies import Policy
from app.models.users import User

class InsuranceFraudGraph:
    def __init__(self):
        self.graph = nx.Graph()
        self.entity_map = {
            'policy': [],
            'claim': [],
            'user': [],
            'reviewer': []
        }
        self.policy_claim_map = defaultdict(list)
        
    def build_graph_from_db(self):
        """Construct insurance relationship graph from database"""
        # Fetch all relevant data from database
        policies = Policy.query.all()
        claims = Claim.query.all()
        users = User.query.all()
        
        # Add nodes
        for policy in policies:
            self.graph.add_node(policy.id, type='policy', 
                              premium=policy.premium_amount, 
                              start_date=policy.start_date.strftime('%Y-%m-%d'))
            
        for claim in claims:
            self.graph.add_node(claim.id, type='claim', 
                              amount=claim.amount if hasattr(claim, 'amount') else 0, 
                              status=claim.status)
            if claim.policy_id:
                self.policy_claim_map[claim.policy_id].append(claim.id)
            
        for user in users:
            self.graph.add_node(user.id, type='user', 
                              role=user.role,
                              name=f"{user.first_name} {user.last_name}")
            
        # Create connections
        for claim in claims:
            if claim.policy_id:
                self.graph.add_edge(claim.policy_id, claim.id, rel='policy_claim')
            if claim.user_id:
                self.graph.add_edge(claim.id, claim.user_id, rel='claim_user')
            if claim.reviewed_by:
                self.graph.add_edge(claim.id, claim.reviewed_by, rel='claim_reviewer')
            
        for policy in policies:
            if policy.user_id:
                self.graph.add_edge(policy.id, policy.user_id, rel='policy_user')
                
        # Connect policies with same holder
        holder_policies = defaultdict(list)
        for policy in policies:
            if policy.user_id:
                holder_policies[policy.user_id].append(policy.id)
            
        for policies in holder_policies.values():
            for p1, p2 in combinations(policies, 2):
                self.graph.add_edge(p1, p2, rel='shared_holder')

    def detect_suspicious_patterns(self):
        """Identify potential fraud clusters"""
        results = {}
        
        # 1. Users with many claims
        users = [n for n,attr in self.graph.nodes(data=True) 
                if attr['type'] == 'user']
        results['users_with_many_claims'] = [
            user for user in users 
            if self.graph.degree(user) > 5
        ]
        
        # 2. Employee Review Patterns
        results['review_patterns'] = []
        for user in [n for n,attr in self.graph.nodes(data=True) 
                    if attr['type'] == 'user' and attr.get('role') == 'employee']:
            claims = [c for c in self.graph.neighbors(user) 
                     if self.graph.nodes[c]['type'] == 'claim']
            if len(claims) > 10:
                results['review_patterns'].append({
                    'employee': user,
                    'claim_count': len(claims),
                    'avg_claim_amount': sum(
                        self.graph.nodes[c]['amount'] for c in claims
                    )/len(claims) if claims else 0
                })
        
        # 3. Policy Holder Patterns
        results['holder_patterns'] = defaultdict(list)
        for holder, policies in self.policy_claim_map.items():
            if len(policies) > 3:
                results['holder_patterns'][holder] = {
                    'claim_count': len(policies),
                    'total_claimed': sum(
                        self.graph.nodes[p]['amount'] for p in policies
                    )
                }
                
        return results

    def get_graph_data(self):
        """Get graph data for visualization"""
        pos = nx.spring_layout(self.graph)
        nodes = []
        edges = []
        
        # Process nodes
        for node, attr in self.graph.nodes(data=True):
            nodes.append({
                'id': node,
                'type': attr['type'],
                'x': float(pos[node][0]),
                'y': float(pos[node][1])
            })
            
        # Process edges
        for u, v, attr in self.graph.edges(data=True):
            edges.append({
                'source': u,
                'target': v,
                'type': attr['rel']
            })
            
        return {
            'nodes': nodes,
            'edges': edges
        } 