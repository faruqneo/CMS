const Individual = require('../model/individual');
const Member = require('../model/member');
const moment = require('moment'); 

// function for name
function titleCase(str) {
    var splitStr = str.toLowerCase().split(' ');
    for (var i = 0; i < splitStr.length; i++) {
        // You do not need to check if i is larger than splitStr length, as your for does that for you
        // Assign it back to the array
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
    }
    // Directly return the joined string
    return splitStr.join(' ').trim(); 
 }


//Load list for individual list
exports.individualList = async (req, res) => {
    try {
        let individual = await Individual.find({}).populate({ path : 'member',  select: 'name -_id' });
        res.render('individuals',{
            individual
        });
    } catch (error) {
        console.log(error)
    }
}


exports.addIndividual = (req, res) => {
    Member.find({},function(err, members){
        res.render('add_individuals', {
            encodedJson : encodeURIComponent(JSON.stringify(members)),
            members
        })
    });
}


exports.addNew = (req, res) => {
    req.checkBody('project', 'Project is required').notEmpty();
    req.checkBody('branch', 'Branch is required').notEmpty();
    req.checkBody('bitbucket_link', 'Bitbucket Link is required').notEmpty();
    req.checkBody('client_name', 'Client Name is required').notEmpty();
    req.checkBody('manager', 'Manager is required').notEmpty();
    req.checkBody('member', 'Member is required').notEmpty();
    req.checkBody('domains', 'Domain is required').notEmpty();
    req.checkBody('ec2', 'EC2 is required').notEmpty();

    let errors = req.validationErrors();

    if(errors)
    {
        Member.find({},function(err, members){
            res.render('add_individuals',{
                errors,
                members
            })      
        });  
    }
    else
    {
        let individual = new Individual();
        let { project, branch, bitbucket_link, client_name, manager, member, domains, ec2, pem } = req.body;
        individual.project = project;
        individual.branch = branch;
        individual.bitbucket_link= bitbucket_link;
        individual.client_name = titleCase(client_name);
        individual.manager = titleCase(manager);
        individual.domains = domains;
        individual.ec2 = ec2;
        individual.pem = pem;
        individual.member = member;
        individual.save(function(err){
            if(err)
            {
               console.log(err)
            }
            else
            {

                res.redirect('/cms/dashboard/individual/list')
            }
        });
    }
}

//update for individuals
exports.individualsUpdate = async (req, res) => {
    req.checkBody('project', 'project is required').notEmpty();
    req.checkBody('branch', 'branch is required').notEmpty();
    req.checkBody('bitbucket_link', 'bitbucket_link is required').notEmpty();
    req.checkBody('client_name', 'client_name is required').notEmpty();
    req.checkBody('manager', 'manager is required').notEmpty();
    req.checkBody('member', 'member is required').notEmpty();
    req.checkBody('domains', 'domains is required').notEmpty();
    req.checkBody('ec2', 'ec2 is required').notEmpty();
    req.checkBody('pem', 'pem is required').notEmpty();

    let errors = req.validationErrors();
    
    if(errors)
    {
        res.render('individualsView',{
            errors
        }); 
    }
    else
    {
        let individual = req.body;
        individual.updatedAT = moment().format('MMMM Do YYYY, h:mm:ss a');
        let id = {_id:req.params.id};
        Individual.updateOne(id, individual, function(err){
            if(err)
            {
                console.log(err)
            }
            else
            {
                res.redirect('/cms/dashboard/individual/list')
            }
        })

    }
}

exports.individualsView = (req, res) => {
    Individual.findById(req.params.id).populate({ path: 'member', select: 'name -_id' }).exec(function(err, individual){
        Member.find({}).sort('createdAt').exec(function(err, members){
            res.render('individualsView',{
                members,
                individual
            });
        });
    });
}


exports.individualsDelete = (req, res) => {
    let id = {_id:req.params.id}
    Individual.deleteOne(id, function(err){
        if(err)
        {
            console.log(err)
        }
        else
        {
            res.redirect('/cms/dashboard/individual/list')
        }
    })
}


exports.individualSitePromise =async (project, developer) => {
    //  console.log(project)
    return await Individual.findOne({project}).populate({ path: 'member', select: 'email -_id' });
}